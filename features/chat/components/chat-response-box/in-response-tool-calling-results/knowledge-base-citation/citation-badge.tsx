import React, { useState } from "react";
import { DocumentViewer } from "@/components/document-viewer";
import {
  IconBrandGoogleDrive,
  IconBrandOnedrive,
  IconBrandNotion,
  IconFileText,
  IconWorld,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

// Define the colors for each source
const sourceColors: { [key: string]: string } = {
  uploadedDocument: "#4CAF50",
  OneDrive: "#0078D4",
  GDrive: "#4285F4",
  Notion: "#000000",
  Confluence: "#172B4D",
  Website: "#FFA500",
};

// Define the icons for each source
const sourceIcons: { [key: string]: React.ReactNode } = {
  uploadedDocument: <IconFileText size={18} />,
  OneDrive: <IconBrandOnedrive size={18} />,
  GDrive: <IconBrandGoogleDrive size={18} />,
  Notion: <IconBrandNotion size={18} />,
  Confluence: <IconBrandNotion size={18} />,
  Website: <IconWorld size={18} />,
};

interface Citation {
  documentName: string;
  pages: { page: number }[];
  similarity?: number;
}

interface CitationBadgeProps {
  citations: Citation[];
  citationSource: string;
}

const CitationBadge = ({ citations, citationSource }: CitationBadgeProps) => {
  const color = sourceColors[citationSource];
  const icon = sourceIcons[citationSource];

  if (citations.length === 0) return null;

  return (
    <div className="space-y-4">
      {citations.map((citation, index) => (
        <CitationItem
          key={index}
          citation={citation}
          color={color}
          icon={icon}
        />
      ))}
    </div>
  );
};

interface CitationItemProps {
  citation: Citation;
  color: string;
  icon: React.ReactNode;
}

const CitationItem = ({ citation, color, icon }: CitationItemProps) => {
  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  const handleDocumentClick = (pageNumber: number) => {
    setSelectedPage(pageNumber);
  };

  const handleCloseViewer = () => {
    setSelectedPage(null);
  };

  return (
    <div className="relative flex flex-col space-y-2">
      {/* Document Header */}
      <div className="flex items-center ">
        <div
          className="rounded-full p-2 flex items-center justify-center"
          style={{
            color: color,
          }}
        >
          {icon}
        </div>
        <div className="text-sm font-medium truncate">
          {citation.documentName}
        </div>
      </div>

      {/* Pages */}
      <div className="flex flex-wrap gap-2 pl-5">
        {citation.pages.map((page, index) => (
          <Button
            key={index}
            style={{ backgroundColor: `${color}20` }}
            variant="ghost"
            size={"xs"}
            onClick={() => handleDocumentClick(page.page)}
            className="text-xs px-3 py-1 rounded-full"
          >
            Page {page.page}
          </Button>
        ))}
      </div>

      {/* Document Viewer */}
      {selectedPage && (
        <DocumentViewer
          documentName={citation.documentName}
          pageNumber={selectedPage}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};

export default CitationBadge;
