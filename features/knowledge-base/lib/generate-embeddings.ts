import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const openAIApiKey: string = process.env.OPENAI_API_KEY || "";

if (!openAIApiKey) throw new Error("OpenAI API key not found.");

export const generateChunks = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 80,
  lengthFunction: (input) => input.length,
});

export const generateEmbeddings = new OpenAIEmbeddings(
  {
    openAIApiKey,
    modelName: "text-embedding-3-large",
  },
  { maxRetries: 3 }
);
