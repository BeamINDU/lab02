import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createWorker } from 'tesseract.js';
import useToast from "../../hooks/useToast";
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

import ExportModal from "./ExportModal";
import { SourceFileData } from "../../interface/file"

interface ProcessPageProps {
  sourceFileData: SourceFileData[];
}

interface OptionProps {
  label: string; 
  value: string;
}

export default function ProcessPage () {
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();

  const language = useSelector((state: RootState) => state.files.language);
  const files = useSelector((state: RootState) => state.files.files);

  const [filePreview, setFilePreview] = useState<string>();
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [ocrStatus, setOcrStatus] = useState<string>('');

  const [sourceFiles, setSourceFiles] = useState<OptionProps[]>([]);
  const [selectedSourceFile, setSelectedSourceFile] = useState<string>("");

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    if (files) {
      const listFiles = files?.map(item => ({
        label: item.fileName || "Unknown File",
        value: item.fileName || "",
      })) || [];
      setSourceFiles(listFiles);
    }
  }, []);

  const handleBack = () => {
    router.push("/reading");
  };

  const handleTranslate = () => {
    if (selectedSourceFile === "") {
      toastError("Please select at least one source file.");
      return;
    }
  
    const selectedFile = files.find(file => file.fileName === selectedSourceFile);
    
    if (selectedFile) {
      if (selectedFile.fileType?.startsWith("image/")) {
        readImageText(selectedFile.url);
      } else {
        toastError("Selected file is not an image.");
      }
    } else {
      toastError("No file found with the selected name.");
    }
  };

  // Handlers for ExportModal
  const handleOpenExportModal = () => setIsExportModalOpen(true);
  
  const handleCloseExportModal = () => setIsExportModalOpen(false);

  const handleSaveExport = (option: OptionProps[] | null) => {
    if (option) {
      const fileNames = option.map((file) => file.label).join(", ");
      toastSuccess(`File ${fileNames} saved successfully`);
    }
  };

  const handleExportTxt = (option: OptionProps[] | null) => {
    if (option) {
      toastSuccess(`Exported to text successfully.`);
    }
  };

  const handleSendExternal = (option: OptionProps[] | null) => {
    if (option) {
      toastSuccess(`The result(s) will be sent to the external system.`);
    }
  };

  const readImageText = async (selectedImage: string) => {
    setFilePreview(selectedImage);
  
    setProcessing(true);
    setOcrStatus("Processing...");
    const worker = await createWorker("eng", 1, {
      logger: (m) => console.log(m),
    });
  
    try {
      const {
        data: { text },
      } = await worker.recognize(selectedImage);
  
      setOcrResult(text);
      setProcessing(false);
      setOcrStatus("Completed");
    } catch (error) {
      console.error(error);
      setOcrStatus("Error occurred during processing.");
    } finally {
      await worker.terminate();
    }
  };

  return (
    <div className="rounded-lg p-4">
      {/* Back & Export Button*/}
      <div className="flex justify-between items-center mb-3">
        <button className="text-white bg-[#818893] hover:bg-grey-600 font-semibold px-4 py-2 rounded-md text-sm w-24" onClick={handleBack}>
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
            {sourceFiles.map((file, index) => (
              <option key={index} value={file.value}>
                {file.label}
              </option>
            ))}
          </select>
        </div>
        {/* Translate Button */}
        <div className="flex justify-end">
          <button
            onClick={handleTranslate}
            className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-44"
          >
            Translate {language}
          </button>
        </div>
      </div>

      {/* Source and Result Sections */}
      <div className="grid grid-cols-2 gap-6 mt-2">
        <h2 className="text-black text-lg font-bold flex items-center justify-center">Source</h2>
        <h2 className="text-black text-lg font-bold flex items-center justify-center">Result</h2>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {/* Source Section */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center h-[calc(100vh-240px)]">
            {processing ? (
              <p>{ocrStatus}</p>
            ) : filePreview ? ( 
              <img
                src={filePreview}
                alt="Preview"
                className="h-full max-h-full w-auto object-contain"
              />
            ) : (
              <p className="text-gray-500">No file selected</p>
            )}
          </div>
        </div>
        {/* Result Section */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center h-[calc(100vh-240px)]">
            {processing ? (
              <p>{ocrStatus}</p>
            ) : filePreview ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: ocrResult.replace(/\n/g, "<br />").replace(/[=,—,-,+]/g, " "),
                }}
                style={{
                  border: "1px solid white",
                  width: "fit-content",
                  padding: 10,
                  marginTop: 10,
                  borderRadius: 10,
                }}
              />
            ): (
              <p className="text-gray-500">No file selected</p>
            )}
          </div>
        </div>
      </div>
 
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