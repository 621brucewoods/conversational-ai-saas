import { useState, useEffect, useRef } from "react";
import { RichTextareaHandle } from "rich-textarea";
import { COMMAND_REG } from "@/features/chat/utils/slash-menu-utils";
import { useSlashMenuMapLayersList } from "@/features/chat/hooks/use-slash-menu-map-layers-list";
import useROIStore from "@/features/maps/stores/use-roi-store";

interface MenuPosition {
  top: number;
  left: number;
  caret: number;
}

interface UseSlashCommandMenuProps {
  inputValue: string;
  currentRoiGeometries: string[];
  textareaRef: React.RefObject<RichTextareaHandle>;
}

export const useSlashCommandMenu = ({
  inputValue,
  currentRoiGeometries,
  textareaRef,
}: UseSlashCommandMenuProps) => {
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuHeight, setMenuHeight] = useState(0);

  const setSelectedRoiGeometryByName = useROIStore(
    (state) => state.setSelectedGeometryByName
  );

  const { filteredCommands } = useSlashMenuMapLayersList({
    menuPos,
    inputValue,
    commands: currentRoiGeometries,
    maxListLength: 8,
  });

  useEffect(() => {
    if (filteredCommands.length) {
      // Approximate height calculation: 36px per item (24px height + 12px padding)
      setMenuHeight(filteredCommands.length * 36);
    }
  }, [filteredCommands]);

  const completeCommand = (index: number) => {
    if (!textareaRef?.current || !menuPos) return;
    const selected = filteredCommands[index];
    const match = inputValue.slice(0, menuPos.caret).match(COMMAND_REG);
    const command = match?.[1] ?? "";

    setSelectedRoiGeometryByName(selected);
    textareaRef.current.setRangeText(
      `${selected} `,
      menuPos.caret - command.length - 1,
      menuPos.caret,
      "end"
    );

    setMenuPos(null);
    setSelectedIndex(0);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    customKeyHandler?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  ) => {
    if (menuPos && filteredCommands.length) {
      switch (e.code) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev <= 0 ? filteredCommands.length - 1 : prev - 1
          );
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev >= filteredCommands.length - 1 ? 0 : prev + 1
          );
          break;
        case "Enter":
          e.preventDefault();
          completeCommand(selectedIndex);
          break;
        case "Escape":
          e.preventDefault();
          setMenuPos(null);
          setSelectedIndex(0);
          break;
        default:
          customKeyHandler?.(e);
      }
    } else {
      customKeyHandler?.(e);
    }
  };

  return {
    menuPos,
    setMenuPos,
    selectedIndex,
    setSelectedIndex,
    menuHeight,
    filteredCommands,
    completeCommand,
    handleKeyDown,
  };
};
