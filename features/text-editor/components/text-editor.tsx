"use client";
import React, { useEffect } from "react";
import { locales } from "@blocknote/core";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useTheme } from "next-themes";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  BlockNoteEditor,
  BlockNoteSchema,
  defaultInlineContentSpecs,
} from "@blocknote/core";
import {
  DefaultReactSuggestionItem,
  SuggestionMenuController,
  SuggestionMenuProps,
} from "@blocknote/react";
import { IconSparkles } from "@tabler/icons-react";
import { Mention, Command } from "../schema/text-editor-schema";

const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    mention: Mention,
    command: Command,
  },
});

// Custom Slash Menu Component
function CustomSlashMenu(
  props: SuggestionMenuProps<DefaultReactSuggestionItem>
) {
  return (
    <div className="absolute z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-2 min-w-[300px]">
      {props.items.map((item, index) => (
        <div
          key={index}
          className={`p-2 cursor-pointer hover:bg-gray-100 rounded-xl flex items-center gap-2 ${
            props.selectedIndex === index ? "bg-gray-100" : ""
          }`}
          onClick={() => {
            props.onItemClick?.(item);
          }}
        >
          {item.icon && <span className="w-5 h-5">{item.icon}</span>}
          <div>
            <div className="text-sm font-semibold">{item.title}</div>
            {item.subtext && (
              <div className="text-sm text-gray-500">{item.subtext}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Define a custom item to insert "Hello World"
const insertAssistantItem = (editor: BlockNoteEditor) => ({
  title: "Assistant",
  onItemClick: () => {
    editor.addStyles({
      textColor: "black",
      bold: true,
      backgroundColor: "blue",
    });
    editor.insertInlineContent("Assistant: ");
  },
  aliases: ["assistant"],
  group: "Custom",
  icon: <IconSparkles stroke={1} size={25} />,
  subtext: "Ask AI for analysis",
});

interface TextEditorProps {
  inputText?: string;
}
const TextEditor = ({ inputText }: TextEditorProps) => {
  const locale = locales["en"];
  const { theme: appTheme } = useTheme();
  const blocknoteTheme = appTheme === "dark" ? "dark" : "light";
  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    schema,
    dictionary: {
      ...locale,
      placeholders: {
        ...locale.placeholders,
        default: "Press '/' for commands",
        heading: "This is a custom heading",
      },
    },
    initialContent: inputText
      ? [
          {
            type: "paragraph",
            content: inputText,
          },
        ]
      : undefined,
  });

  useEffect(() => {
    const initializeMarkdown = async () => {
      if (editor && inputText) {
        const blocks = await editor.tryParseMarkdownToBlocks(inputText);
        editor.replaceBlocks(editor.document, blocks);
      }
    };
    initializeMarkdown();
  }, [editor, inputText]);

  return (
    <div className="h-full">
      <main>
        <div
          className={`bg-white dark:bg-background h-fit pb-20 rounded-b-xl pt-10 border-t-0 ${
            inputText ? "border-none" : "border border-gray-300 shadow-md"
          }`}
        >
          {editor && (
            <BlockNoteView
              editor={editor}
              slashMenu={false}
              theme={blocknoteTheme}
            >
              <SuggestionMenuController
                triggerCharacter="/"
                suggestionMenuComponent={CustomSlashMenu}
              />
            </BlockNoteView>
          )}
        </div>
      </main>
    </div>
  );
};

export default TextEditor;
