import React, { useState, useCallback } from "react";
import { IconX, IconUpload, IconFile } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Folder {
  name: string;
  id?: string | number;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (files: FileList) => void;
  isUploadComplete: boolean;
  setUploadComplete: (value: boolean) => void;
  currentFolder?: Folder | null;
  acceptedFileTypes?: string;
  title?: string;
  multiple?: boolean;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onFileSelect,
  currentFolder = null,
  isUploadComplete,
  setUploadComplete,
  acceptedFileTypes = ".pdf,.doc,.docx,.txt",
  title = "Add New Document",
  multiple = true,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const createFileList = (files: File[]): FileList => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const handleConfirmUpload = async () => {
    if (selectedFiles.length > 0) {
      setUploadComplete(false);
      try {
        const fileList = createFileList(selectedFiles);
        await onFileSelect(fileList);
        setSelectedFiles([]);
        onClose();
      } catch (error) {
        console.error("Error during file upload:", error);
      } finally {
        setUploadComplete(true);
      }
    }
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {selectedFiles.length === 0 ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
          >
            <input {...getInputProps()} />
            <IconUpload
              size={32}
              className="mx-auto text-muted-foreground mb-4"
            />
            <p className="text-sm text-muted-foreground mb-2">
              {isDragActive
                ? "Drop the files here..."
                : "Drop your files here or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Supported format: PDF
            </p>
            <Button variant="outline">Select Files</Button>
          </div>
        ) : (
          <ScrollArea className="h-[250px] w-full rounded-md border p-4">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center p-3 rounded-md mb-2 bg-muted"
              >
                <IconFile size={20} className="text-muted-foreground mr-3" />
                <div className="flex-grow">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </ScrollArea>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Selected folder:</span>
          <Badge variant="outline" className="font-normal">
            {currentFolder ? currentFolder.name : "All Documents"}
          </Badge>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          {selectedFiles.length > 0 && (
            <Button
              onClick={handleConfirmUpload}
              disabled={!isUploadComplete}
              size="sm"
            >
              {!isUploadComplete && <Loader2 className="mr-2 animate-spin" />}
              Upload
              {multiple && selectedFiles.length > 1
                ? ` (${selectedFiles.length} files)`
                : ""}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadModal;
