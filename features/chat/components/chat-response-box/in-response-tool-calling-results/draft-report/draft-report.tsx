"use client";
import React from "react";
import TextEditor from "@/features/text-editor/components/text-editor";

interface DraftReportProps {
  report: string;
}
const DraftReport = ({ report }: DraftReportProps) => {
  return (
    <div className="h-full w-full overflow-y-auto  text-black">
      <TextEditor inputText={report} />
    </div>
  );
};

export default DraftReport;
