import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from 'react-redux';
import { clearFiles } from '../../redux/actions/fileActions';
import { SourceFileData } from "../../interface/file"
import { useSelector } from 'react-redux';
import { selectAllSourceFiles } from '../../redux/selectors/fileSelectors';
import useToast from "../../hooks/useToast";
import PreviewData from "../../components/ocr/PreviewData";
import ExportModal from "./ExportModal";
import SaveModal from "./SaveModal";

export default function ProcessPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toastSuccess, toastError } = useToast();

  const sourceFiles = useSelector(selectAllSourceFiles);
  const [files, setFiles] = useState<SourceFileData[]>([]);
  const [selectedSourceFile, setSelectedSourceFile] = useState<number>();
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => {
    if (sourceFiles.length > 0) {
      setFiles(sourceFiles);
    }
  }, [sourceFiles]);

  const handleClear = () => {
    dispatch(clearFiles());
  };

  const handleBack = () => {
    handleClear();
    router.push('/translate');
  } 

  const handleOpenExportModal = () => setIsExportModalOpen(true);
  const handleCloseExportModal = () => setIsExportModalOpen(false);

  const handleOpenSaveModal = () => setIsSaveModalOpen(true);
  const handleCloseSaveModal = () => setIsSaveModalOpen(false);

  const handleSave = (option: SourceFileData[] | null) => {
    if (option) {
      const fileNames = option.map((file) => file.fileName).join(", ");
      toastSuccess(`File ${fileNames} saved successfully`);
    }
  };

  const handleExportTxt = (selectedFiles: SourceFileData[] | null) => {
    if (selectedFiles) {
      selectedFiles.forEach((file) => {
        const fileNameWithoutExtension = file.fileName.split('.').slice(0, -1).join('.');
        const content = file.ocrResult?.map(r => r.translateText).join('\n\n') || '';
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileNameWithoutExtension}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  const handleSendExternal = (selectedFiles: SourceFileData[] | null) => {
    if (selectedFiles) {
      selectedFiles.forEach((file) => {
        
      });
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
            {files?.map((file) => (
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
          {files
            .filter((item) => item.id === selectedSourceFile)
            .map((item) => (
              <div key={item.id} className="mb-0">
                {item?.ocrResult?.map((page) => (
                  <div
                    key={`${item.id}-${page.page}`}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-5"
                  >
                    {/* Image Section */}
                    <div className="border rounded-xl shadow-md p-4 h-full flex flex-col">
                      <div className="text-sm font-medium text-gray-500 mb-2">Page {page.page}</div>
                      <div className="flex-1 h-full max-h-[71vh] overflow-auto">
                        <PreviewData data={page.extractedText ?? ""} />
                      </div>
                    </div>
                    {/* Text Preview Section */}
                    <div className="border rounded-xl shadow-md p-4 h-full flex flex-col">
                      <div className="text-sm font-medium text-gray-500 mb-2">Page {page.page}</div>
                      <div className="flex-1 h-full max-h-[71vh] overflow-auto">
                        <PreviewData data={page.translateText ?? ""} />
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
        sourceFiles={files}
        onSave={handleSave}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleCloseExportModal}
        sourceFiles={files}
        onExportTxt={handleExportTxt}
        onSendExternal={handleSendExternal}
      />
    </div>
  );
}