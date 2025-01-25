"use client";

import { useMemo } from "react";
import {
  filterSlashMenuMapLayers,
  MAX_LIST_LENGTH,
} from "@/features/chat/utils/slash-menu-utils";

interface MenuPosition {
  top: number;
  left: number;
  caret: number;
}

interface UseSlashMenuMapLayersListProps {
  menuPos: MenuPosition | null;
  inputValue: string;
  commands: string[];
  maxListLength?: number;
}

export const useSlashMenuMapLayersList = ({
  menuPos,
  inputValue,
  commands,
  maxListLength = MAX_LIST_LENGTH,
}: UseSlashMenuMapLayersListProps) => {
  const filteredCommands = useMemo(
    () =>
      filterSlashMenuMapLayers(menuPos, inputValue, commands, maxListLength),
    [menuPos, inputValue, commands, maxListLength]
  );

  return {
    filteredCommands,
  };
};
