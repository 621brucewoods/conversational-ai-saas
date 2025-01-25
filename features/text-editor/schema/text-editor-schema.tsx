import { createReactInlineContentSpec } from "@blocknote/react";
import {
  IconSparkles,
  IconFolderSearch,
  IconFileExport,
  IconDeviceAnalytics,
  IconWorldSearch,
  IconDatabaseImport,
} from "@tabler/icons-react";
import { JSX } from "react";
export const Mention = createReactInlineContentSpec(
  {
    type: "mention",
    propSchema: {
      mention: {
        default: "Unknown",
      },
    },
    content: "none",
  },
  {
    render: (props) => (
      <span
        style={{ backgroundColor: "rgba(255, 165, 0, 0.2)" }}
        className="p-1 rounded-md font-bold text-sm"
      >
        @{props.inlineContent.props.mention}
      </span>
    ),
  }
);

export const Command = createReactInlineContentSpec(
  {
    type: "command",
    propSchema: {
      command: {
        default: "Unknown",
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      return (
        <span
          className={`font-bold text-sm rounded-md gap-1 inline-flex items-center px-2 py-1`}
        >
          {props.inlineContent.props.command}
        </span>
      );
    },
  }
);
