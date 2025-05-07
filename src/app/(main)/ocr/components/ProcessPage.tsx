import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { clearFiles } from '@/app/store/file/fileActions';
import { selectAllSourceFiles } from '@/app/store/file/fileSelectors';
import useToast from "@/app/hooks/useToast";
import PreviewData from "@/app/components/ocr/PreviewData";
import ExportModal from "./ExportModal";
import SaveModal from "./SaveModal";
import { saveOcr } from '@/app/lib/api/ocr';
import { SourceFileData, ParamSaveOcrRequest } from "@/app/lib/interfaces";

export default function ProcessPage() {
  const { data: session } = useSession();
  const { toastSuccess, toastError } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();
  const initialFiles = useSelector(selectAllSourceFiles);
  const [sourceFiles, setSourceFiles] = useState<SourceFileData[]>([]);
  const [selectedSourceFile, setSelectedSourceFile] = useState<number>();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const userId = session?.user?.userId ?? "admin";

  useEffect(() => {
    if (sourceFiles.length === 0 && initialFiles.length > 0) {
      setSourceFiles(initialFiles);
      dispatch(clearFiles());
    }
  }, [initialFiles]);

  const handleBack = () => {
    router.push('/ocr');
  } 

  const handleOpenExportModal = () => setIsExportModalOpen(true);
  const handleCloseExportModal = () => setIsExportModalOpen(false);

  const handleOpenSaveModal = () => setIsSaveModalOpen(true);
  const handleCloseSaveModal = () => setIsSaveModalOpen(false);

  const handleSave = async (selectedFiles: SourceFileData[]) => {
    try {
      const updatedFiles = [...sourceFiles];

      for (const file of selectedFiles) {
        const param: ParamSaveOcrRequest  = {
          ocrId: file.ocrId ?? 0,
          fileId: file.fileId ?? 0,
          fileName: file.fileName,
          fileType: file.fileType,
          base64Data: file.base64Data,
          ocrResult: file.ocrResult ?? [],
          userId: userId,
        }

        const response = await saveOcr(param);
        const index = updatedFiles.findIndex(f => f.id === file.id);
        if (index !== -1) {
          updatedFiles[index] = { ...response, id: file.id };
        }
      }

      setSourceFiles(updatedFiles); 
      toastSuccess("OCR saving completed.");
      handleCloseSaveModal();
    } catch (error) {
      console.error("Error during OCR saving", error);
      toastError("Error during OCR saving.");
    }
  };

  const handleSendExternal = (selectedFiles: SourceFileData[] | null) => {
    if (selectedFiles) {
      selectedFiles.forEach((file) => {});
      toastSuccess(`The result(s) will be sent to the external system.`);
    }
  };

  return (
    <div className="flex flex-col p-2">
      {/* Back & Save & Export Button*/}
      <div className="grid grid-cols-2 gap-4 h-full">
        <div className="flex flex-col">
          <div className="mb-4 space-x-2">
            <button className="text-white bg-[#818893] hover:bg-gray-500 font-semibold px-4 py-2 rounded-md text-sm w-24" onClick={handleBack}>
              Back
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-2 mb-4">
            <button className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-24" onClick={handleOpenSaveModal}>
              Save
            </button>
            <button className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-24" onClick={handleOpenExportModal}>
              Export
            </button>
          </div>
        </div>
      </div>
      {/* SourceFiles Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center w-full">
          <select
            id="files-select"
            className="px-4 py-2 border rounded-md w-full"
            value={selectedSourceFile}
            onChange={(e) => setSelectedSourceFile(Number(e.target.value))}
          >
            <option value={-1}>--- Please select source file ---</option>
            {sourceFiles?.map((file) => (
              <option key={file.id} value={file.id}>
                {file.fileName}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Source and Result Sections */}
      {selectedSourceFile && (
        <div className="mt-4">
          {sourceFiles
            ?.filter((file) => file.id === selectedSourceFile)
            ?.map((file) => (
              <div key={file.id} className="mb-0">
                {file?.ocrResult?.map((page) => (
                  <div
                    key={`${file.id}-${page.page}`}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-0"
                  >
                    {/* Image Section */}
                    <div className="border rounded-xl shadow-md p-4 h-full flex flex-col">
                      <div className="text-sm font-medium text-gray-500 mb-2">Page {page.page}</div>
                      <img
                        src={page.blobUrl ?? `data:image/png;base64,${page.base64Data}`}
                        alt={`Page ${page.page}`}
                        className="max-w-full max-h-[71vh] object-contain rounded"
                      />
                    </div>
                    {/* Text Preview Section */}
                    <div className="border rounded-xl shadow-md p-4 h-full flex flex-col">
                      <div className="text-sm font-medium text-gray-500 mb-2">Page {page.page}</div>
                      <div className="flex-1 h-full max-h-[71vh] overflow-auto">
                        <PreviewData data={page.extractedText ?? ""} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          ))}
        </div>
      )}

      {/* Save Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={handleCloseSaveModal}
        sourceFiles={sourceFiles}
        onSave={handleSave}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleCloseExportModal}
        sourceFiles={sourceFiles}
        // onSendExternal={handleSendExternal}
      />

    </div>
  );
}