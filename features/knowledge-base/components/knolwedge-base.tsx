"use client";
import React, { useState, useEffect } from "react";
import { useButtonsStore } from "@/stores/use-buttons-store";
import useToastMessageStore from "@/stores/use-toast-message-store";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { deleteDocumentFile } from "../actions/document-actions";

import { useDocumentUpload } from "@/hooks/docs-hooks/use-document-upload";
import { formatDbDate } from "@/utils/general/general-utils";

import Sidebar from "./knowledge-base-sidebar";
import DocumentsTable from "./documents-table";
import AddGroupModal from "./add-group-modal";
import EditDocumentModal from "./edit-document-modal";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import FileUploadModal from "@/features/ui/modals/file-upload-modal";

import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useUserStore } from "@/stores/use-user-profile-store";
import MaxDocsAlertDialog from "./max-docs-alert-dialog";

interface KnowledgeBaseProps {
  initialDocuments: DocumentFile[];
}

const KnowledgeBase = ({ initialDocuments }: KnowledgeBaseProps) => {
  const isSidebarCollapsed = useButtonsStore(
    (state) => state.isSidebarCollapsed
  );
  const setToastMessage = useToastMessageStore(
    (state) => state.setToastMessage
  );

  // --------------------
  // States
  // --------------------

  const maxDocs = useUserStore((state) => state.maxDocs);

  const [folders, setFolders] = useState<any>([
    { id: "all-documents", name: "All Documents" },
  ]);
  const [currentFolder, setCurrentFolder] = useState<any>(null);
  const [documents, setDocuments] = useState(initialDocuments);

  const { handleFileUpload } = useDocumentUpload({ currentFolder });

  const [isMaxDocsDialogOpen, setIsMaxDocsDialogOpen] = useState(false);

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const [docToDelete, setDocToDelete] = useState<any>(null);

  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [isUploadComplete, setUploadComplete] = useState(true);

  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [editDocumentId, setEditDocumentId] = useState<any>(null);
  const [editedDocumentName, setEditedDocumentName] = useState("");

  // For opening Dots menu (folder or document)
  const [menuOpenId, setMenuOpenId] = useState<any>(null);
  const [menuOpenFolderId, setMenuOpenFolderId] = useState<any>(null);

  const router = useRouter();
  // --------------------
  // Hooks / Effects
  // --------------------
  useEffect(() => {
    if (folders?.length > 0 && !currentFolder) {
      setCurrentFolder(folders[0]);
    }
  }, [folders, currentFolder]);

  // Close any open "document action" menu if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (menuOpenId !== null) {
        const menuElement = document.getElementById(`doc-menu-${menuOpenId}`);
        if (menuElement && !menuElement.contains(event.target)) {
          setMenuOpenId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenId]);

  // Update documents when initialDocuments prop changes
  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  // Update folders when documents change
  useEffect(() => {
    // 1. Gather unique folder IDs from documents
    const uniqueFolderIds = [
      ...new Set(documents.map((doc) => doc.folder_id).filter(Boolean)),
    ];

    // 2. Build folder objects
    const dynamicFolders = uniqueFolderIds.map((fid) => ({
      id: fid,
      name: fid,
    }));

    // 3. Combine them with the "All Documents" folder
    setFolders([
      { id: "all-documents", name: "All Documents" },
      ...dynamicFolders,
    ]);
  }, [documents]);

  // Close any open "folder action" menu if user clicks outside
  useEffect(() => {
    const handleClickOutsideFolder = (event: any) => {
      if (menuOpenFolderId !== null) {
        const menuElement = document.getElementById(
          `folder-menu-${menuOpenFolderId}`
        );
        if (menuElement && !menuElement.contains(event.target)) {
          setMenuOpenFolderId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutsideFolder);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideFolder);
  }, [menuOpenFolderId]);

  // --------------------
  // Actions / Handlers
  // --------------------

  const handleFileSelect = async (files: FileList) => {
    if (documents.length >= maxDocs) {
      setIsMaxDocsDialogOpen(true);
      return;
    }
    setUploadComplete(false);
    try {
      await handleFileUpload({
        target: { files },
      } as React.ChangeEvent<HTMLInputElement>);

      router.refresh();
      setToastMessage("Document uploaded successfully", "success");
    } catch (error: any) {
      setToastMessage("Error processing files", "error");
    }
  };

  const handleCloseAddDocumentModal = () => {
    setIsAddDocumentModalOpen(false);
    setUploadComplete(true);
  };

  const handleAddGroup = () => {
    if (newGroupName.trim() !== "") {
      setFolders([
        ...folders,
        { id: newGroupName.trim(), name: newGroupName.trim() },
      ]);
      setNewGroupName("");
      setIsAddGroupModalOpen(false);
    }
  };

  const handleDeleteClick = (docId: any) => {
    setIsDeleteLoading(false);
    setDocToDelete(docId);
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDeleteDocument = async () => {
    if (!docToDelete) return;
    setIsDeleteLoading(true);

    const { success: deleteSuccess, message: deleteSuccessMessage } =
      await deleteDocumentFile(docToDelete);

    if (deleteSuccess) {
      router.refresh();
      setToastMessage("Document deleted successfully", "success");
      setDocuments(documents.filter((doc: any) => doc.id !== docToDelete));
    } else {
      setToastMessage(deleteSuccessMessage, "error");
    }

    setDocToDelete(null);
    setIsConfirmDeleteModalOpen(false);
  };

  const handleDeleteGroup = (groupId: any) => {
    setFolders((prev: any) =>
      prev.filter((folder: any) => folder.id !== groupId)
    );
    setDocuments((prevDocs: any) =>
      prevDocs.map((doc: any) =>
        doc.folderId === groupId ? { ...doc, folderId: null } : doc
      )
    );
    // If we deleted the folder currently selected, revert to "All Documents"
    if (currentFolder && currentFolder.id === groupId) {
      const allDocsFolder = folders.find(
        (fld: any) => fld.id === "all-documents"
      );
      setCurrentFolder(allDocsFolder);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesFolder =
      currentFolder && currentFolder.id !== "all-documents"
        ? doc.folder_id === currentFolder.id
        : true;
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  // --------------------
  // Render
  // --------------------
  if (!folders || !documents) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div
        className={`flex h-screen text-gray-800 overflow-hidden flex-grow transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* SIDEBAR */}
        <Sidebar
          folders={folders}
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          setIsAddGroupModalOpen={setIsAddGroupModalOpen}
          handleDeleteGroup={handleDeleteGroup}
          menuOpenFolderId={menuOpenFolderId}
          setMenuOpenFolderId={setMenuOpenFolderId}
        />

        {/* MAIN CONTENT */}
        <div className="flex-grow p-6">
          <div className="mb-6">
            <h1 className="text-2xl text-primary font-bold mb-2">
              {currentFolder ? currentFolder.name : "All Documents"}
            </h1>
            <p className="text-muted-foreground text-sm mb-4">
              Here you can add documents that you want your AI Assistants to
              access across the app.
            </p>

            <div className="flex items-center">
              <div className="relative w-full max-w-md">
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <IconSearch
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              <Button
                onClick={() => setIsAddDocumentModalOpen(true)}
                className="ml-4 flex items-center"
                variant={"primary-blue"}
              >
                <IconPlus size={16} className="inline-block mr-2" />
                Add Document
              </Button>
            </div>
          </div>

          {/* DOCUMENTS TABLE */}
          <ScrollArea className="h-[75vh] rounded-xl border border-stone-300 dark:border-stone-600">
            <DocumentsTable
              documents={filteredDocuments}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
              editDocumentId={editDocumentId}
              setEditDocumentId={setEditDocumentId}
              editedDocumentName={editedDocumentName}
              setEditedDocumentName={setEditedDocumentName}
              handleDeleteClick={handleDeleteClick}
              formatDbDate={formatDbDate}
            />
          </ScrollArea>
        </div>

        {/* ADD GROUP MODAL */}
        <AddGroupModal
          isOpen={isAddGroupModalOpen}
          onClose={() => setIsAddGroupModalOpen(false)}
          newGroupName={newGroupName}
          setNewGroupName={setNewGroupName}
          handleAddGroup={handleAddGroup}
        />

        {/* ADD DOCUMENT MODAL */}
        <FileUploadModal
          isOpen={isAddDocumentModalOpen}
          onClose={handleCloseAddDocumentModal}
          onFileSelect={handleFileSelect}
          isUploadComplete={isUploadComplete}
          setUploadComplete={setUploadComplete}
          currentFolder={{ name: "Documents" }}
          // acceptedFileTypes=".pdf, .doc, .docx, .txt"
          acceptedFileTypes=".pdf"
        />

        {/* EDIT DOCUMENT MODAL */}
        <EditDocumentModal
          editDocumentId={editDocumentId}
          setEditDocumentId={setEditDocumentId}
          editedDocumentName={editedDocumentName}
          setEditedDocumentName={setEditedDocumentName}
          documents={documents}
          setDocuments={setDocuments}
        />

        {/* DELETE CONFIRMATION MODAL */}
        <ConfirmationModal
          isOpen={isConfirmDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this document? This action cannot be undone."
          confirmText="Delete"
          onCancel={() => setIsConfirmDeleteModalOpen(false)}
          onConfirm={confirmDeleteDocument}
          isDeleting={isDeleteLoading}
        />
      </div>
      <MaxDocsAlertDialog
        isOpen={isMaxDocsDialogOpen}
        onClose={() => setIsMaxDocsDialogOpen(false)}
        maxDocs={maxDocs}
      />
    </>
  );
};

export default KnowledgeBase;
