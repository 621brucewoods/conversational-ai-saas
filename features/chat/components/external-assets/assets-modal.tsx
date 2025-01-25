"use client";

import React, { useState } from "react";
import { useAgolLayersStore } from "@/features/maps/stores/use-agol-layers-store";
import { Button } from "@/components/ui/button";
import useROIStore from "@/features/maps/stores/use-roi-store";
import {
  isValidUrl,
  sanitizeUrl,
  isValidLayerName,
  sanitizeLayerName,
} from "@/utils/validation-utils/validation-utils";
import { fetchSelectedEsriLayer } from "@/lib/fetchers/services/esri/fetch-selected-layer";
import useToastMessageStore from "@/stores/use-toast-message-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  filterFns,
} from "@tanstack/react-table";

import { Loader2, Search } from "lucide-react";

interface AssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const columns: ColumnDef<ArcGISLayer>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      // We run your sanitize function here
      const rawName = row.getValue<string>("name");
      return <div>{sanitizeLayerName(rawName)}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
  },
];

const AssetsModal: React.FC<AssetsModalProps> = ({ isOpen, onClose }) => {
  const [globalFilter, setGlobalFilter] = useState("");

  const setToastMessage = useToastMessageStore(
    (state) => state.setToastMessage
  );

  const availableAgolLayers = useAgolLayersStore(
    (state) => state.availableAgolLayers
  );
  const setAgolLayerRequestedToImport = useAgolLayersStore(
    (state) => state.setAgolLayerRequestedToImport
  );
  const removeAgolLayerFromList = useAgolLayersStore(
    (state) => state.removeAgolLayerFromList
  );

  const addRoiGeometry = useROIStore((state) => state.addRoiGeometry);

  // 3. TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLayerImportingPending, setIsLayerImportingPending] = useState(false);

  // 4. Create the table instance with your data and columns
  const table = useReactTable({
    data: availableAgolLayers ?? [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: filterFns.includesString,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Early return if modal is not open
  if (!isOpen) return null;

  const handleCloseModal = () => {
    setRowSelection({});
    onClose();
  };

  const handleImportLayerClick = async () => {
    setIsLayerImportingPending(true);
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    if (!selectedRows.length) {
      setToastMessage("No layers selected", "error");
      setIsLayerImportingPending(false);
      return;
    }

    // Import each selected layer
    for (const layer of selectedRows) {
      if (layer && isValidUrl(layer.url) && isValidLayerName(layer.name)) {
        // 1) Trigger the ROI import
        await fetchSelectedEsriLayer(layer, addRoiGeometry);
        setAgolLayerRequestedToImport(layer);
        removeAgolLayerFromList(layer.url);
      } else {
        setToastMessage(`Invalid layer: ${layer?.name}`, "error");
      }
    }

    // Clear selected rows so the table resets
    setRowSelection({});
    setIsLayerImportingPending(false);

    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Assets</DialogTitle>
          </DialogHeader>

          <div className="relative px-6 mt-2 mb-4">
            <div className="relative max-w-sm">
              {/* Absolutely positioned icon */}
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Search className="h-4 w-4" />
              </span>

              <Input
                placeholder="Search layers..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* ScrollArea is the parent */}
          <ScrollArea className="flex-1 relative">
            {/* 6. TanStack Table rendering */}
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="flex justify-between items-center mt-6 px-6 pb-6">
            <Button
              onClick={handleImportLayerClick}
              disabled={availableAgolLayers.length === 0}
            >
              {isLayerImportingPending && <Loader2 className="animate-spin" />}
              Import Layer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AssetsModal;
