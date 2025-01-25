import React from "react";
import { X } from "lucide-react";

interface EditDocumentModalProps {
  editDocumentId: any;
  setEditDocumentId: (id: any) => void;
  editedDocumentName: string;
  setEditedDocumentName: (name: string) => void;
  documents: any[];
  setDocuments: (docs: any[]) => void;
}

const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  editDocumentId,
  setEditDocumentId,
  editedDocumentName,
  setEditedDocumentName,
  documents,
  setDocuments,
}) => {
  if (!editDocumentId) {
    return null;
  }

  const handleSave = () => {
    setDocuments(
      documents.map((doc: any) =>
        doc.id === editDocumentId
          ? {
              ...doc,
              name: editedDocumentName,
              lastEdited: new Date().toISOString(),
            }
          : doc
      )
    );
    setEditDocumentId(null);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px] relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={() => setEditDocumentId(null)}
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Edit Document Name
        </h2>
        <input
          type="text"
          value={editedDocumentName}
          onChange={(e) => setEditedDocumentName(e.target.value)}
          className="w-full border rounded-md p-2 text-sm"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-3 py-1 text-gray-700 rounded hover:underline transition"
            onClick={() => setEditDocumentId(null)}
          >
            Cancel
          </button>
          <button
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDocumentModal;
