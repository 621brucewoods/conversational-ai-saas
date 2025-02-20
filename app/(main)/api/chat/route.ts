import { openai } from "@ai-sdk/openai";
import { azure } from "@ai-sdk/azure"; // You can also use Azure's hosted GPT models. More info: https://sdk.vercel.ai/providers/ai-sdk-providers
import {
  type Message,
  type CoreUserMessage,
  streamText,
  convertToCoreMessages,
} from "ai";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

import { NextResponse } from "next/server";

import {
  getChatById,
  saveChat,
  saveMessages,
  searchGeeDatasets,
} from "@/lib/database/chat/queries";
import {
  getUsageForUser,
  getUserRoleAndTier,
  incrementRequestCount,
} from "@/lib/database/usage";
import { getPermissionSet } from "@/lib/auth";
import {
  requestGeospatialAnalysis,
  requestLoadingGeospatialData,
  requestRagQuery,
  draftReport,
  requestWebScraping,
} from "@/lib/database/chat/tools";
import {
  generateUUID,
  sanitizeResponseMessages,
  getMostRecentUserMessage,
  generateTitleFromUserMessage,
  getFormattedDate,
} from "@/features/chat/utils/general-utils";

// export const maxDuration = 30;

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedRoiGeometryInChat,
    mapLayersNames,
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
    selectedRoiGeometryInChat: any;
    mapLayersNames: string[];
  } = await request.json();

  const supabase = await createClient();
  const { data: authResult, error: authError } = await supabase.auth.getUser();
  if (authError || !authResult?.user) {
    return NextResponse.json({ error: "Unauthenticated!" }, { status: 401 });
  }

  const userId = authResult.user.id;
  // Fetch the user's role + subscription
  const userRoleRecord = await getUserRoleAndTier(userId);
  if (!userRoleRecord) {
    return NextResponse.json(
      { error: "Failed to get role/subscription" },
      { status: 403 }
    );
  }

  const { role, subscription_tier: subscriptionTier } = userRoleRecord;
  const { maxRequests, maxArea } = await getPermissionSet(
    role,
    subscriptionTier
  );
  const usage = await getUsageForUser(userId);
  if (usage.requests_count >= maxRequests) {
    return NextResponse.json(
      { error: "Request limit exceeded" },
      { status: 403 }
    );
  }

  const cookieStore = request.headers.get("cookie");
  const chat = await getChatById(id);

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  // Increment usage count
  await incrementRequestCount(userId);

  if (!chat) {
    const generatedTitle = await generateTitleFromUserMessage({
      message: messages[0] as CoreUserMessage,
    });
    await saveChat({ id: id, title: generatedTitle });
  }

  const userMessageId = generateUUID();
  await saveMessages({
    messages: [
      {
        ...userMessage,
        id: userMessageId,
        createdAt: new Date(),
        chatId: id,
      },
    ],
  });

  // System instructions
  const systemInstructions = `Today is ${getFormattedDate()}. You are an AI Assistant specializing in geospatial analytics. 
  Be kind, warm, and professional. Use emojis where appropriate to enhance user experience. 
  When user asks for a geospatial analysis or data, never ask for the location unless you run the analysis and you get a corresponding error. Users provide the name of their region of interest (ROI) data when requesting an analysis.
  Always highlight important outputs and provide help in interpreting results. NEVER include map URLs or map legends/palette (like classes) in your responses.
  Refuse to answer questions irrelevant to geospatial analytics or the platform's context. You have access to several tools. If running a tool fails, and you thought you would be to fix it with a change, try 3 times until you fix it.
  IF USER ASKS FOR DRAFTING REPORTS, YOU SHOULD RUN THE "draftReport" TOOL, AND JUST CONFIRM THE DRAFTING OF THE REPORT. YOU SHOULD NOT EVER DRAFT REPORT IN THE CHAT."
  You also have access to a tool that can load geospatial data. First, run the tool that searches the database containing GEE datasets information to find the datasets best match user's request. Afterwards, run the web scraper tool to find extra info such as how to set the visualization parameter (pay attention to the code snippet from the official doc you will recieve). After that provide a short summary of what data with what parameters you're going to load to make sure if it's exactly what the user needs. After everything goes well and the user confirmed the details of the analysis to run, use all the information to load the dataset. 
  Another tool you have access to is a RAG query tool that you can use to answer questions you don't know the answer to.
  Before running any geospatial analysis, make sure the layer name doesn't already exist in the map layers. No geospatial analysis is available for the year 2025, so you SHOULD NOT run analysis for 2025 even if the user asks for it.
  When executing analyes (not ragQueryRetrieval, though):
  1. Always provide a clear summary of what was analyzed
  2. Highlight key findings and patterns in the data,
  3. Try to tabulate some parts of the results/descriptions for the sake of clarity.`;

  // Prepend system instructions to the conversation as a separate message for the AI
  const systemMessage = {
    role: "assistant", // Change role to "assistant" to avoid unhandled role errors
    content: systemInstructions,
  };

  // Add the system message at the beginning of the conversation
  const processedMessages = [
    systemMessage,
    ...messages.filter((msg: any) => msg.role !== "system"),
  ] as Array<Message>;

  const result = await streamText({
    model: openai("gpt-4o"),
    // model: azure("gpt-4o"),  // You can also use Azure's hosted GPT models
    maxSteps: 5,
    messages: convertToCoreMessages(processedMessages),
    onFinish: async ({ response }) => {
      if (userId) {
        try {
          const responseMessagesWithoutIncompleteToolCalls =
            sanitizeResponseMessages(response.messages);

          await saveMessages({
            messages: responseMessagesWithoutIncompleteToolCalls.map(
              (message) => {
                const messageId = generateUUID();

                return {
                  id: messageId,
                  chatId: id,
                  draftedReportId: null,
                  role: message.role,
                  content: message.content,
                  createdAt: new Date(),
                };
              }
            ),
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },

    tools: {
      requestGeospatialAnalysis: {
        description: `Today is ${getFormattedDate()}, so you should be able to help the user with requests by up to this date. No analysis should be done for the year of 2025 as analyses are not yet ready for the new year.
          After running an analysis: 1. Provide a clear summary of what was analyzed and why, 2. Explain the key findings and their significance. NEVER PROVIDE MAP URLs or MAP LEGENDS FROM THE ANALYSES IN THE RESPONSE. Also the maximum area the user can request analysis for is ${maxArea} sq km. per request.
          It should be noted that the land cover map (start date: 2015) and bi-temporal land cover change map (start date: 2015) are based on Sentinel-2 imagery, UHI (start date: 2015) is based on Landsat imagery. For all "CHANGE" maps, the user must provide "startDate2 and endDate2". If in doubt about an analysis (e.g., it may not exactly match the analysis we have), you have to double check with the user.`,
        parameters: z.object({
          functionType: z.string()
            .describe(`The type of analysis to execute. It can be one of the following:
            'Urban Heat Island (UHI) Analysis',
            'Land Use/Land Cover Maps',
            'Land Use/Land Cover Change Maps'.`),
          startDate1String: z
            .string()
            .describe(
              "The start date for the first period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
            ),
          endDate1String: z
            .string()
            .describe(
              "The end date for the first period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
            ),
          startDate2String: z
            .string()
            .optional()
            .describe(
              "The start date for the second period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
            ),
          endDate2String: z
            .string()
            .optional()
            .describe(
              "The end date for the second period. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
            ),
          aggregationMethod: z.string().describe(
            `The method to use for aggregating the data. It means that in a time-series, what method is used to aggregate data for a given point/pixel in the final map/analysis delivered. For land use/land cover mapping, it's always "Median", and thus you don't need to ask user for that. It can be one of the following:
            'Mean',
            'Median',
            'Min',
            'Max',
            . Note that the user may not provide it, so by default its value should be 'Max', and you should not ask the user to tell you what method to use. If the default value is used, make sure to mention it in the response to user that your analysis is based on the maximum va.
          `
          ),
          layerName: z
            .string()
            .describe(
              "The name of the layer to be displayed. You ask the user about it if they don't provide it. Otherwise, use a name based on the function type, but make sure the name is concise and descriptive. "
            ),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
            ),
        }),
        execute: async (args) =>
          requestGeospatialAnalysis({
            ...args,
            cookieStore,
            selectedRoiGeometryInChat,
            maxArea,
          }),
      },
      requestLoadingGeospatialData: {
        description: `The user has requested loading and visualizing geospatial data. You should load the data based on the user's request.`,
        parameters: z.object({
          geospatialDataType: z.string().describe(
            `The type of geospatial data to load. It can be one of the following:
      'Load GEE Data'`
          ),
          selectedRoiGeometry: z
            .object({
              type: z.string().optional(),
              coordinates: z.array(z.array(z.array(z.number()))).optional(),
            })
            .optional()
            .describe(
              "The selected region of interest (ROI) geometry. You should run the analysis based on the user's request."
            ),
          dataType: z
            .string()
            .describe(
              `The type of data to load. It can be one of the following: 'Image', 'ImageCollection'.`
            ),

          divideValue: z
            .number()
            .describe(
              `The value to divide the image by. If based on the scraped data you didn't find it, use your logic to see if it should be set based on the dataset. Sometimes, the division is done within a "cloud mask" function, so you should extract its value from there in that case. If you decide not to set it, set it to 1.`
            ),
          datasetId: z.string().describe("The ID of the GEE dataset to load."),
          startDate: z
            .string()
            .describe(
              "The start date for the data to load. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
            ),
          endDate: z
            .string()
            .describe(
              "The end date for the data to load. The date format should be 'YYYY-MM-DD'. But convert any other date format the user gives you to that one."
            ),
          visParams: z.union([
            // single-band case
            z.object({
              bands: z.array(z.string()).length(1),
              palette: z.array(z.string()),
              min: z.number().optional(),
              max: z.number().optional(),
            }),
            // multi-band case
            z.object({
              bands: z.array(z.string()),
              min: z.number().optional(),
              max: z.number().optional(),
            }),
          ])
            .describe(`You should set the visualization parameters best matching user's request for the data to load and best way of visualization:
            1) If you want to combine more than one band for visualization, set visParams using the bands: [...] attribute.
            2) Otherwise, use the palette: [...] attribute (and do not include bands).
            As an example, RGB visualization should be set as: {bands: ['red', 'green', 'blue']}. Forest loss should be using pellete if it's one band.
      `),
          labelNames: z
            .array(z.string())
            .describe(
              "The label names for the data to load. You should run the analysis based on the user's request. Choose the closet label names even if it doesn't 100% match what you already know. Infer it."
            ),
          layerName: z
            .string()
            .describe(
              "The name of the layer to be displayed. You ask the user about it if they don't provide it. Otherwise, use a name based on the function type, but make sure the name is concise and descriptive. "
            ),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
            ),
        }),
        execute: async (args) => {
          return requestLoadingGeospatialData({
            ...args,
            cookieStore,
            selectedRoiGeometryInChat,
          });
        },
      },
      searchGeeDatasets: {
        description: `Find the datasets available in Google Earth Engine (GEE) that best match the user's query.`,
        parameters: z.object({
          query: z.string().describe("The name of the dataset to search."),
          startDate: z
            .string()
            .optional()
            .describe(
              "The start date for the data to load based on the scraping results. This could be the year or the date in a format. This shows the start date the data is available."
            ),
          endDate: z
            .string()
            .optional()
            .describe(
              "The end date for the data to load based on the scraping result. This could be the year or the date in a format. This shows the end date the data is available."
            ),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
            ),
        }),
        execute: async (args) => {
          const result = searchGeeDatasets(args.query);
          return result;
        },
      },

      scrapeWebpage: {
        description:
          "Scrape the webpage of the GEE dataset to learn what dataset_id, how data is visualized, legends, any division by a value, etc. you should use for the the requested dataset. For example, one of the things you should learn is whether you need to have a band combination (e.g., [b1, b2, b3]) or a palette (e.g., ['red', 'green', 'blue']) to visualize the image.",
        parameters: z.object({
          url: z
            .string()
            .describe(
              "The asset URL of the webpage to scrape. The name of the column you're scraping for this parameter should be 'asset_url'."
            ),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
            ),
        }),

        execute: async (args) => {
          return requestWebScraping(args);
        },
      },
      requestRagQuery: {
        description: `The user has some documents with which a RAG has been built. If you're asked a question that you didn't know the answer, run the requestRagQuery tool that is based on user's documents to get the answer.`,
        parameters: z.object({
          query: z.string().describe("The user's query text."),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
            ),
        }),
        execute: async (args) => requestRagQuery({ ...args, cookieStore }),
      },
      draftReport: {
        description: `When this tool is called, draft a report that summarizes the analyses and their results. The report should be concise and easy to understand, highlighting the key findings and insights. Markdown is supported.`,
        parameters: z.object({
          messages: z
            .array(z.object({}))
            .describe(
              "The messages exchanged between the user and the you. You should use relevant messages in the chat to generate the report the user requested. Make sure you format the report in a standard way with all the common structures."
            ),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the report to be drafted in one sentence confirming you're working on the user's request."
            ),
          reportFileName: z
            .string()
            .optional()
            .describe("Provide a concise name for the report file."),
        }),
        execute: async (args) =>
          draftReport({ ...args, messages: processedMessages }),
      },
      checkMapLayersNames: {
        description:
          "Here are the the names of the current map layers. If you run a geospatial analysis, and you select a name for the layer, you should should first check the layer names to make sure the name you selected is not already in use. You shouldn't output any message regarding the name you select.",
        parameters: z.object({
          layerName: z
            .string()
            .describe("The name of the layer to be displayed."),
          title: z
            .string()
            .optional()
            .describe(
              "Briefly describe the title of the analysis in one sentence confirming you're working on the user's request."
            ),
        }),

        execute: async (args) => {
          return mapLayersNames;
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
