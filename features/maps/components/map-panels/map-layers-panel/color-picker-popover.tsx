"use client";

import * as React from "react";
import { HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useColorPickerStore from "@/features/maps/stores/use-color-picker-store";

// Combined in one file:
export default function ColorPickerPopover() {
  const { isPickerOpen, pickedColor, setPickedColor, setPickerOpen } =
    useColorPickerStore();

  // The popover is controlled by `isPickerOpen`
  const open = isPickerOpen;

  const handleOpenChange = (openValue: boolean) => {
    // If user clicks outside or presses Esc, close it
    if (!openValue) {
      setPickerOpen(false);
    }
  };

  const handlePickColor = (newColor: string) => {
    if (pickedColor.layerName) {
      setPickedColor(newColor, pickedColor.layerName);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {/* 
        1) We'll dynamically place the trigger
           near the "Pick Color" item. So here we can
           render a 'dummy' or hidden trigger.
      */}
      <PopoverTrigger asChild>
        <span style={{ display: "none" }} />
      </PopoverTrigger>

      {/* 
        2) The popover content shows the color picker
        - Use side="right" or sideOffset to position it
          near the menu item. 
      */}
      <PopoverContent side="right" sideOffset={6} className="z-[9999] p-2">
        {pickedColor.layerName && (
          <HexColorPicker
            color={pickedColor.color}
            onChange={handlePickColor}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
