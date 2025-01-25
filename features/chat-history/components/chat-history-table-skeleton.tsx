import { FC } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

const ChatHistoryTableSkeleton: FC = () => {
  // Create an array of 5 items to simulate multiple rows loading
  const rows = Array(5).fill(null);

  return (
    <Table className="mb-10">
      <TableHeader className="sticky top-0 bg-accent">
        <TableRow>
          {/* Matches the checkbox column */}
          <TableHead className="w-10 text-sm font-semibold text-secondary-foreground" />
          <TableHead className="text-sm font-semibold text-secondary-foreground">
            Title
          </TableHead>
          <TableHead className="text-sm font-semibold text-secondary-foreground">
            Created At
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((_, index) => (
          <TableRow key={index} className="animate-pulse">
            {/* Checkbox skeleton */}
            <TableCell className="w-10 p-4">
              <div className="h-4 bg-accent rounded w-4 mx-auto" />
            </TableCell>
            {/* Title skeleton */}
            <TableCell className="p-4">
              <div className="h-4 bg-accent rounded w-48" />
            </TableCell>
            {/* Created At skeleton */}
            <TableCell className="p-4">
              <div className="h-4 bg-accent rounded w-24" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ChatHistoryTableSkeleton;
