import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";

interface DocumentsTableProps {
  documents: any[];
  menuOpenId: any;
  setMenuOpenId: (id: any) => void;
  editDocumentId: any;
  setEditDocumentId: (id: any) => void;
  editedDocumentName: string;
  setEditedDocumentName: (name: string) => void;
  handleDeleteClick: (docId: any) => void;
  formatDbDate: (dateStr: string) => string;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({
  documents,
  menuOpenId,
  setMenuOpenId,
  editDocumentId,
  setEditDocumentId,
  editedDocumentName,
  setEditedDocumentName,
  handleDeleteClick,
  formatDbDate,
}) => {
  return (
    <Table>
      <TableHeader className="sticky top-0">
        <TableRow>
          <TableHead className="text-sm font-bold text-muted-foreground">
            Name
          </TableHead>
          <TableHead className="text-sm font-bold text-muted-foreground text-center">
            Owner
          </TableHead>
          <TableHead className="text-sm font-bold text-muted-foreground text-center">
            Pages
          </TableHead>
          <TableHead className="text-sm font-bold text-muted-foreground text-center">
            Last Edited
          </TableHead>
          <TableHead className="text-sm font-bold text-muted-foreground text-center"></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {documents.map((doc: any) => (
          <TableRow
            key={doc.id}
            className="hover:bg-muted/50 dark:hover:bg-secondary"
          >
            <TableCell className="text-primary/90">
              {editDocumentId === doc.id ? (
                // If we’re editing this document’s name
                <input
                  type="text"
                  value={editedDocumentName}
                  onChange={(e) => setEditedDocumentName(e.target.value)}
                  className="w-full border p-1 text-sm"
                />
              ) : (
                doc.name
              )}
            </TableCell>

            <TableCell className="text-primary/90 text-center">
              {doc.owner}
            </TableCell>
            <TableCell className="text-primary/90 text-center">
              {doc.number_of_pages}
            </TableCell>
            <TableCell className="text-primary/90 text-center">
              {formatDbDate(doc.created_at)}
            </TableCell>

            <TableCell className="text-left">
              <DropdownMenu
                open={menuOpenId === doc.id}
                onOpenChange={(open) => setMenuOpenId(open ? doc.id : null)}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-primary" size="sm">
                    <IconDotsVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-28" id={`doc-menu-${doc.id}`}>
                  {/* <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditDocumentId(doc.id);
                      setEditedDocumentName(doc.name);
                    }}
                    className="flex items-center"
                  >
                    <IconPencil className="mr-2 h-4 w-4" />
                    Update
                  </DropdownMenuItem> */}

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(doc.id);
                    }}
                    className="flex items-center text-red-600 focus:text-red-600"
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}

        {documents.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground"
            >
              No documents found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default DocumentsTable;
