import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createWorker } from 'tesseract.js';
import useToast from "../../hooks/useToast";
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

import ExportModal from "./ExportModal";
import PreviewFile from "../../components/ocr/PreviewFile";
import { SourceFileData } from "../../interface/file"

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

interface ProcessPageProps {
  backUrl: string;
}

interface OcrResult {
  sourceFile: SourceFileData;
  ocrResult: string;
}

interface Options {
  label: string;
  value: string;
}

const optionsLanguage = [
  { label: 'English', value: 'eng' },
  { label: 'Japanese', value: 'jpn' },
  { label: 'Thai', value: 'tha' },
];

export default function ProcessPage({ backUrl }: ProcessPageProps) {
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();
  const [firstLoad, setFirstLoad] = useState(true);

  const outputLanguage = useSelector((state: RootState) => state.files.output_language);
  const sourceFiles = useSelector((state: RootState) => state.files.files);

  const [ocrResult, setOcrResult] = useState<OcrResult[] | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  const [optionsSourceFiles, setOptionsSourceFiles] = useState<Options[]>([]);
  const [selectedSourceFile, setSelectedSourceFile] = useState<string>("");

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    if (sourceFiles) {
      const listFiles = sourceFiles?.map(item => ({
        label: item.fileName || "Unknown File",
        value: item.fileName || "",
      })) || [];
      setOptionsSourceFiles(listFiles);
    }
  }, []);

  const handleBack = () => {
    router.push(backUrl);
  };

  const handleTranslate = () => {
    setFirstLoad(false);
    if (selectedSourceFile === "") {
      toastError("Please select at least one source file.");
      return;
    }

    const selectedFile = sourceFiles.find(file => file.fileName === selectedSourceFile);

    if (selectedFile) {
      if (selectedFile.fileType?.startsWith("image/")) {
        readImageText(selectedFile);
      } else {
        readPdfText(selectedFile);
      }
    } else {
      toastError("No file found with the selected.");
    }
  };

  const handleOpenExportModal = () => setIsExportModalOpen(true);

  const handleCloseExportModal = () => setIsExportModalOpen(false);

  const handleSaveExport = (option: Options[] | null) => {
    if (option) {
      const fileNames = option.map((file) => file.label).join(", ");
      toastSuccess(`File ${fileNames} saved successfully`);
    }
  };

  const handleExportTxt = (option: Options[] | null) => {
    if (option) {
      toastSuccess(`Exported to text successfully.`);
    }
  };

  const handleSendExternal = (option: Options[] | null) => {
    if (option) {
      toastSuccess(`The result(s) will be sent to the external system.`);
    }
  };

  const readImageText = async (selectedImage: SourceFileData) => {
    setProcessing(true);
    setOcrStatus("Processing, please wait...");
    setOcrResult([]);

    const worker = await createWorker(outputLanguage, 1, {
      logger: (m) => console.log(m),
    });

    try {
      const {
        data: { text },
      } = await worker.recognize(selectedImage.url);

      setOcrResult(prevResult => [
        ...(prevResult || []),
        { sourceFile: selectedImage, ocrResult: text },
      ]);

      setProgress(((1 - 1) + 1) / 1);

      setProcessing(false);
      setOcrStatus("Completed");
    } catch (error) {
      console.error(error);
      setOcrStatus("Error occurred during processing.");
    } finally {
      await worker.terminate();
    }
  };

  const readPdfText = async (selectedImage: SourceFileData) => {
    setProcessing(true);
    setOcrStatus("Processing, please wait...");
    setOcrResult([]);
  
    const worker = await createWorker(outputLanguage, 1, {
      logger: (m) => console.log(m),
    });
  
    try {
      const pdf = await getDocument(selectedImage.url).promise;  // ใช้ pdf.js เพื่อโหลดไฟล์ PDF
  
      const numPages = pdf.numPages;
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);  // ดึงแต่ละหน้า
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
  
        if (context) { // Add a check to ensure context is not null
          canvas.height = viewport.height;
          canvas.width = viewport.width;
  
          // ร่างภาพจากหน้า PDF ลงบน Canvas
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
  
          // Convert canvas to Base64 URL
          const base64Image = canvas.toDataURL('image/png');  // จะได้ Base64 URL ของภาพในรูปแบบ PNG
  
          // ใช้ Tesseract.js OCR บน Canvas (ภาพที่แปลงจาก PDF)
          const { data: { text } } = await worker.recognize(canvas);
  
          // เก็บผลลัพธ์ของ OCR จากแต่ละหน้า
          setOcrResult(prevResult => [
            ...(prevResult || []),
            {
              sourceFile: {
                ...selectedImage,
                url: base64Image,
              },
              ocrResult: text,
            },
          ]);
  
          // อัพเดตความคืบหน้า
          setProgress(((pageNum - 1) + 1) / numPages);
        } else {
          throw new Error("Failed to get canvas context.");
        }
      }
  
      // เมื่อประมวลผลเสร็จ
      setOcrStatus("Completed");
      setProcessing(false);
    } catch (error) {
      console.error(error);
      setOcrStatus("Error occurred during processing.");
    } finally {
      await worker.terminate();  // ปิดการทำงานของ Worker หลังการใช้งาน
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
            {optionsSourceFiles.map((file, index) => (
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
            Translate {optionsLanguage.find(item => item.value === outputLanguage)?.label}
          </button>
        </div>
      </div>

      {/* Source and Result Sections */}
      <div className="grid grid-cols-2 gap-6 mt-2">
        <h2 className="text-black text-lg font-bold flex items-center justify-center">Source</h2>
        <h2 className="text-black text-lg font-bold flex items-center justify-center">Result</h2>
      </div>

      {firstLoad && (<div className="grid grid-cols-2 gap-4">
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center h-[calc(100vh-245px)]">
            <p className="text-gray-500"></p>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center h-[calc(100vh-245px)]">
            <p className="text-gray-500"></p>
          </div>
        </div>
      </div>
      )}

      {processing && (<div className="progress-bar">
          {progress && <progress value={progress * 100} max="100">{progress * 100}%</progress>}
          {progress && <p>{Math.round(progress * 100)}% Complete</p>}
        </div>
      )}

      {!firstLoad && (
        <div className="h-[calc(100vh-240px)] overflow-y-auto -mr-4">
          {ocrResult?.map((item, index) => (
            <div key={index}>
              {/* Page Header */}
              <h2 className="text-lg font-semibold mb-3">Page {index + 1}</h2>
              <hr className="mb-4 border-gray-300" />

              <div className="grid grid-cols-2 gap-4">
                {/* Source Section */}
                <div className="flex-1">
                  <div className="bg-white rounded-lg shadow-md h-[calc(100vh-300px)]">
                    {processing ? (
                      <p className="p-4">{ocrStatus}</p>
                    ) : item ? (
                      <PreviewFile fileData={item.sourceFile ?? null} />
                    ) : (
                      <p className="text-gray-500">No file selected</p>
                    )}
                  </div>
                </div>

                {/* Result Section */}
                <div>
                  <div className="mr-4 bg-white rounded-lg shadow-md h-[calc(100vh-300px)]">
                    {processing ? (
                      <p className="p-4">{ocrStatus}</p>
                    ) : item ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: item.ocrResult.replace(/\n/g, "<br />").replace(/[=,—,-,+]/g, " "),
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
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleCloseExportModal}
        optionsSourceFiles={optionsSourceFiles}
        onSave={handleSaveExport}
        onExportTxt={handleExportTxt}
        onSendExternal={handleSendExternal}
      />
    </div>

  );
}