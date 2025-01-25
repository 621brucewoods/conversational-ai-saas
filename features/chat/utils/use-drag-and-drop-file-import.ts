import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { dragAndDropFileAnalyzer } from "@/features/chat/utils/drag-and-drop-file-analyzer";
import useToastMessageStore from "@/stores/use-toast-message-store";
import useROIStore from "@/features/maps/stores/use-roi-store";
import { removeExtension } from "@/utils/general/general-utils";

type AddAttachmentFunction = (file: File) => void;

export const useDragAndDropFileImport = (
  addAttachment: AddAttachmentFunction
) => {
  const setToastMessage = useToastMessageStore(
    (state) => state.setToastMessage
  );

  const setNewAttachedRoi = useROIStore((state) => state.setNewAttachedRoi);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        try {
          const { type: fileType, content: fileContent } =
            await dragAndDropFileAnalyzer(file);

          addAttachment(file);
          if (["shapefile", "geojson"].includes(fileType)) {
            const fileNameWithoutExtension = removeExtension(file.name);
            setNewAttachedRoi({
              id: fileNameWithoutExtension,
              geometry: fileContent,
              name: fileNameWithoutExtension,
              source: "attached",
            });
          }
          setToastMessage(
            `"${file.name} (${fileType})" added to session assets successfully.`,
            "success"
          );
        } catch (error) {
          setToastMessage(
            `Error processing "${file.name}": ${
              error || "Your file is not supported/valid."
            }`,
            "error"
          );
        }
      }
    },
    [addAttachment, setToastMessage]
  );

  return useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });
};
