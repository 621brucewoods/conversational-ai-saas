"use client";

import { Layers } from "lucide-react";

interface CommandMenuProps {
  commands: string[];
  index: number;
  top: number;
  left: number;
  complete: (index: number) => void;
  menuHeight: number;
}

const SlashMenuForMapLayers: React.FC<CommandMenuProps> = ({
  commands,
  index,
  top,
  left,
  complete,
  menuHeight,
}) => {
  // Calculate the adjusted top position considering the header height
  const headerHeight = 55; // 12px (py-3) + 20px (text) + 12px (py-3)
  const footerHeight = 32; // 8px (py-2) + 16px (text) + 8px (py-2)
  const adjustedMenuHeight = menuHeight + headerHeight + footerHeight;

  return (
    <div
      className="fixed z-[1000] w-fit rounded-lg overflow-hidden bg-secondary shadow-xl border border-stone-300 dark:border-stone-600"
      style={{ top: top - adjustedMenuHeight, left }}
    >
      {/* Header */}
      {commands.length > 0 && (
        <div className="px-4 py-3 bg-secondary border-b border-stone-300 dark:border-stone-600">
          <div className="flex items-center gap-4">
            <Layers size={20} className="text-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              ROI Layers
            </h3>
          </div>
        </div>
      )}

      {/* Command List */}
      <div className="max-h-64 overflow-y-auto">
        {commands.map((cmd, i) => (
          <div
            key={cmd}
            className={`px-4 py-2.5 cursor-pointer transition-colors duration-150
              ${
                index === i
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-foreground hover:bg-gray-100"
              } 
              text-sm font-medium flex items-center gap-2`}
            onMouseDown={(e) => {
              e.preventDefault();
              complete(i);
            }}
          >
            {cmd}
          </div>
        ))}
      </div>

      {/* Footer instruction */}
      {commands.length > 0 && (
        <div className="px-4 py-2 bg-seondary border-t border-gray-200">
          <p className="text-xs text-muted-foreground">
            Use ↑↓ to navigate, enter to select
          </p>
        </div>
      )}
    </div>
  );
};

export default SlashMenuForMapLayers;
