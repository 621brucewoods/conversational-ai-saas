"use client";

import { createRegexRenderer } from "rich-textarea";

export const MAX_LIST_LENGTH = 8;

// Keep this the same for menu detection
export const COMMAND_REG = /\B\/([\-+\w]*)$/;

// Modified to match commands without requiring the slash
export const createCommandHighlightRegex = (commands: string[]) => {
  return new RegExp(`(${commands.join("|")})(?=\\s|$)`, "g");
};

export const getCommandRendererSlashMenuMapLayersRenderer = (
  commands: string[]
) => {
  const highlightRegex = createCommandHighlightRegex(commands);
  return createRegexRenderer([
    [
      highlightRegex,
      {
        background: "#EAF5F9",
        color: "#4276AA",
        borderRadius: "3px",
        border: "1px solid #B3D4E0",
      },
    ],
  ]);
};

export const filterSlashMenuMapLayers = (
  menuPos: { caret: number } | null,
  inputValue: string,
  commands: string[],
  maxLength: number = MAX_LIST_LENGTH
): string[] => {
  if (!menuPos) return [];
  const match = inputValue.slice(0, menuPos.caret).match(COMMAND_REG);
  const command = match?.[1] ?? "";
  return commands
    .filter((cmd) => cmd.toLowerCase().startsWith(command.toLowerCase()))
    .slice(0, maxLength);
};
