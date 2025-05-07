import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from 'react-redux';
import { clearFiles } from '@/app/store/file/fileActions';
import { SourceFileData } from "@/app/lib/interfaces"
import { useSelector } from 'react-redux';
import { selectAllSourceFiles } from '@/app/store/file/fileSelectors';
import useToast from "@/app/hooks/useToast";
import ExportModal from "./ExportModal";
import PreviewFile from "@/app/components/ocr/PreviewFile";

interface ProcessPageProps {
  backUrl: string;
}

export default function ProcessPage({ backUrl }: ProcessPageProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toastSuccess, toastError } = useToast();

  const sourceFiles = useSelector(selectAllSourceFiles);
  // const [sourceFiles, setSourceFiles] = useState<SourceFileData[]>([]);

  const [selectedSourceFile, setSelectedSourceFile] = useState<string>("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // const [processing, setProcessing] = useState(false);
  // const [ocrStatus, setOcrStatus] = useState<string>('');

  // useEffect(() => {
  //   if (files.length > 0) {
  //     setSourceFiles(files);
  //   }
  // }, [files]);

  const handleClear = () => {
    dispatch(clearFiles());
  };

  const handleBack = () => {
    handleClear();
    router.push(backUrl);
  } 

  const handleOpenExportModal = () => setIsExportModalOpen(true);

  const handleCloseExportModal = () => setIsExportModalOpen(false);

  const handleSaveExport = (option: SourceFileData[] | null) => {
    if (option) {
      const fileNames = option.map((file) => file.fileName).join(", ");
      toastSuccess(`File ${fileNames} saved successfully`);
    }
  };

  const handleExportTxt = (option: SourceFileData[] | null) => {
    if (option) {
      toastSuccess(`Exported to text successfully.`);
    }
  };

  const handleSendExternal = (option: SourceFileData[] | null) => {
    if (option) {
      toastSuccess(`The result(s) will be sent to the external system.`);
    }
  };

  return (
    <div className="rounded-lg p-4">
      {/* Back & Export Button*/}
      <div className="flex justify-between items-center mb-3">
        <button className="text-white bg-[#818893] hover:bg-gray-500 font-semibold px-4 py-2 rounded-md text-sm w-24" onClick={handleBack}>
          Back
        </button>
        <button className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-24" onClick={handleOpenExportModal}>
          Export
        </button>
      </div>

      {/* Language Selection & Translate Button*/}
      <div className="grid grid-cols-2 gap-6">
        {/* Language Selection */}
        <div className="flex items-center space-x-2 w-full">
          <select
            id="files-select"
            className="px-4 py-2 border rounded-md w-full"
            value={selectedSourceFile}
            onChange={(e) => setSelectedSourceFile(e.target.value)}
          >
            <option value="">--- Please select source file ---</option>
            {sourceFiles?.map((file, index) => (
              <option key={index} value={file.fileName}>
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
            {processing ? `Translating... ${Math.round(progress * 100)}%` : `Translate ${optionsLanguage.find(item => item.value === targetLanguage)?.label}`}
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
          <div className="h-[calc(100vh-240px)] overflow-y-auto -mr-4">
            {sourceFiles
              .filter((item) => item.fileName === selectedSourceFile)
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
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: page?.extractedText?.replace(/\n/g, "<br />").replace(/[=,—,-,+]/g, " ") || "",
                                }}
                                style={{
                                  border: "1px solid white",
                                  width: "100%",
                                  maxHeight: "100%",
                                  padding: 10,
                                  borderRadius: 10,
                                  fontSize: 14,
                                  overflowY: "auto",
                                  height: "100%",
                                }}
                              />
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

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleCloseExportModal}
        sourceFiles={sourceFiles}
        onSave={handleSaveExport}
        onExportTxt={handleExportTxt}
        onSendExternal={handleSendExternal}
      />
    </div>

  );
}