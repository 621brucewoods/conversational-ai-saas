import React, { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AI_ASSISTANTS } from "@/custom-configs/ai-assistants";

const AssistantsListInChatInputBoxBtn = () => {
  const [selectedAssistant, setSelectedAssistant] = useState(
    AI_ASSISTANTS.default[0]
  );

  return (
    <div className="absolute left-36 bottom-[11px] -translate-y-2 z-[1000]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="bg-secondary/50 text-xs p-1 text-foreground px-2 rounded-lg border border-stone-300 dark:border-stone-600 hover:bg-secondary/80 flex items-center justify-between w-full outline-none">
            <span className="flex items-center justify-center">
              <span className="font-semibold text-xs mr-1">Assistant:</span>
              <img
                src={AI_ASSISTANTS.icons[selectedAssistant]}
                alt={selectedAssistant}
                className="w-3 h-3 mr-1"
              />
              <span className="font-medium">{selectedAssistant}</span>
            </span>
            <IconChevronDown size={14} stroke={2} className="ml-1" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[200px] bg-popover"
          align="start"
          sideOffset={5}
          side="top"
        >
          {Object.entries(AI_ASSISTANTS).map(
            ([category, assistants], categoryIndex) =>
              Array.isArray(assistants) && (
                <React.Fragment key={category}>
                  {categoryIndex > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="capitalize font-semibold">
                    {category}
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {assistants.map((assistant) => (
                      <DropdownMenuItem
                        key={assistant}
                        className={`flex items-center gap-2 cursor-pointer ${
                          assistant === selectedAssistant ? "bg-accent" : ""
                        }`}
                        onClick={() => setSelectedAssistant(assistant)}
                      >
                        <img
                          src={AI_ASSISTANTS.icons[assistant]}
                          alt={assistant}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{assistant}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </React.Fragment>
              )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AssistantsListInChatInputBoxBtn;
