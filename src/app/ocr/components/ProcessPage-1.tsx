import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from 'react-redux';
import { clearFiles } from '../../redux/actions/fileActions';
import { SourceFileData } from "../../interface/file"
import { useSelector } from 'react-redux';
import { selectAllSourceFiles } from '../../redux/selectors/fileSelectors';
import useToast from "../../hooks/useToast";
import PreviewFile from "./PreviewFile";
import PreviewData from "../../components/ocr/PreviewData";
import ExportModal from "./ExportModal";
import SaveModal from "./SaveModal";

export default function ProcessPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toastSuccess, toastError } = useToast();

  const files = useSelector(selectAllSourceFiles);
  const [sourceFiles, setSourceFiles] = useState<SourceFileData[]>([]);
  const [selectedSourceFile, setSelectedSourceFile] = useState<number>();
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => {
    if (files.length > 0) {
      setSourceFiles(files);
      // setSelectedSourceFile[Number(files[0].id)]
    }
  }, [files]);

  const handleClear = () => {
    dispatch(clearFiles());
  };

  const handleBack = () => {
    handleClear();
    router.push('/ocr');
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
        const content = file.ocrResult?.map(r => r.extractedText).join('\n\n') || '';
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.fileName}.txt`;
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
    <div className="rounded-lg p-4">
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

      {/* Language Selection & Translate Button*/}
      <div className="grid grid-cols-2 gap-6">
        {/* Language Selection */}
        <div className="flex items-center space-x-2 w-full">
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
        {/* Translate Button */}
        <div className="flex justify-end">
          {/* <button
            onClick={handleTranslate}
            className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-44 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={processing}
          >
            {processing ? `Translating... ${Math.round(progress * 100)}%` : `Translate ${optionsLanguage.find(item => item.value === outputLanguage)?.label}`}
          </button> */}
        </div>
      </div>

      {/* Source and Result Sections */}
      {selectedSourceFile && (
        <>
          <div className="grid grid-cols-2 gap-6 mt-2">
            <h2 className="text-black text-lg font-bold flex items-center justify-center">Source</h2>
            <h2 className="text-black text-lg font-bold flex items-center justify-center">Result</h2>
          </div>
          <div className="h-[calc(100vh-245px)] overflow-y-auto -mr-4">
            {sourceFiles
              .filter((item) => item.id === selectedSourceFile)
              .map((item, index) => (
                <div className="mb-2" key={index}>
                  {item.ocrResult?.map((page, pageIndex) => (
                    <div key={pageIndex}>
                      {/* Page Header */}
                      <h2 className="text-lg font-semibold">Page {page.page}</h2>
                      <hr className="mb-4 border-gray-300" />

                      <div className="grid grid-cols-2 gap-4 mb-2">
                        {/* Source Section */}
                        <div className="flex-1">
                          <div className="bg-white rounded-lg shadow-md h-[calc(100vh-293px)]">
                            {page ? (
                              <PreviewFile url={page.blobUrl} type={"image/"} />
                            ) : (
                              <p className="text-gray-500">No file selected</p>
                            )}
                          </div>
                        </div>

                        {/* Result Section */}
                        <div>
                          <div className="mr-4 bg-white rounded-lg shadow-md h-[calc(100vh-293px)]">
                            {page? (
                              <PreviewData data={page.extractedText ?? ""} />
                            ) : (
                              <p className="text-gray-500">No file selected</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            ))}
          </div>
        </>
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
        onExportTxt={handleExportTxt}
        onSendExternal={handleSendExternal}
      />
    </div>

  );
}