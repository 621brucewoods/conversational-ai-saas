"use client";
import React, { useEffect } from "react";
import { IconSparkles } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type Message, type ToolInvocation } from "ai";
import FadeInWithDelay from "../../../ui/fadeIn-with-delay";
import ToolCallingResults from "../in-response-tool-calling-results/tool-calling-results";

interface ChatMessageProps {
  message: Message | ToolInvocation;
  messageResults: ToolCallingMessageResults;
}

const ChatMessage = React.memo(
  ({ message, messageResults }: ChatMessageProps) => {
    const [toolCallTitle, setToolCallTitle] = React.useState("");

    useEffect(() => {
      if ("args" in message) {
        setToolCallTitle(message.args.title);
      } else {
        setToolCallTitle("");
      }
    }, [message]);

    let isAssistant = false;
    let messageContent = "";
    let messageId = "";
    if ("role" in message) {
      messageId = message.id;
      isAssistant = message.role === "assistant";
      messageContent = message.content;
    } else if ("args" in message) {
      isAssistant = true;
      messageContent = message.args.title;
    }

    const content = isAssistant ? (
      <div className="flex justify-center min-w-full mb-10">
        <div className="relative w-[660px]">
          <div className="self-end flex py-3 w-full text-left">
            <div>
              <IconSparkles
                stroke={1}
                className="text-blue-500 h-8 w-8 p-[.5px] mr-1"
              />
            </div>
            <div className="w-full">
              {toolCallTitle ? (
                <div className="prose animate-shimmer text-blue-500 font-semibold">
                  {toolCallTitle}
                </div>
              ) : (
                <ReactMarkdown
                  className="prose prose-md leading-snug max-w-none break-words dark:prose-invert text-foreground/90"
                  remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
                >
                  {messageContent}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="flex justify-center">
        <div className="relative w-[660px] flex justify-end">
          <div className="w-fit max-w-[500px] bg-gray-100 dark:bg-accent/85 p-2 px-5 flex py-3 rounded-3xl text-left">
            {messageContent && (
              <ReactMarkdown className="prose prose-md leading-snug break-words text-foreground/90">
                {messageContent}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    );

    return (
      <div className="flex flex-col">
        {isAssistant ? (
          <FadeInWithDelay delay={10} opacityDuration={1}>
            {content}
          </FadeInWithDelay>
        ) : (
          content
        )}

        {messageResults && (
          <ToolCallingResults
            messageId={messageId}
            messageResults={messageResults}
          />
        )}
      </div>
    );
  }
);

export default ChatMessage;
