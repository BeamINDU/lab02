import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
// import { createWorker } from 'tesseract.js';
import { useDispatch } from 'react-redux';
import { clearFiles } from '../../redux/actions';
import useToast from "../../hooks/useToast";

import { useSelector } from 'react-redux';
// import { RootState } from '../../store/store';
import { RootState } from '../../redux/store';

import ExportModal from "./ExportModal";
import PreviewFile from "../../components/ocr/PreviewFile";
import { SourceFileData } from "../../interface/file"
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { convertFileSizeToMB } from "../../utils/format";

// import { useProcessContext } from '../../context/ProcessContext';

// interface OcrResult {
//   pageNumber: number;
//   file: SourceFileData;
//   extractedText?: string;
// }

// interface OcrResult {
//   page: number,
//   sourceFile: SourceFileData;
//   ocrResult?: string;
// }

// interface Options {
//   label: string;
//   value: string;
// }

// const optionsLanguage = [
//   { label: 'English', value: 'eng' },
//   { label: 'Japanese', value: 'jpn' },
//   { label: 'Thai', value: 'tha' },
// ];

// enum Status {
//   IDLE,
//   UPLOADING,
//   ANALYZING,
//   SUCCESS,
//   ERROR,
// }

interface ProcessPageProps {
  backUrl: string;
}

export default function ProcessPage({ backUrl }: ProcessPageProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toastSuccess, toastError } = useToast();

  // const files = useSelector((state: RootState) => state.files.files);
  const files = useSelector((state: RootState) => state.files.fileData);
  // const outputLanguage = useSelector((state: RootState) => state.files.output_language);
  // const sourceFiles = useSelector((state: RootState) => state.files.files);

  // const { processData } = useProcessContext();

  const [sourceFiles, setSourceFiles] = useState<SourceFileData[]>([]);

  const [selectedSourceFile, setSelectedSourceFile] = useState<string>("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // const [ocrResult, setOcrResult] = useState<OcrResult[] | null>(null);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const [firstLoad, setFirstLoad] = useState(true);
  // const [status, setStatus] = useState(Status.IDLE);

  const workerRef = useRef<Tesseract.Worker | null>(null);

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';
  //   }
  //   const initWorker = async () => {
  //     workerRef.current = await createWorker("eng", 1, {
  //       logger: (m) => console.log(m),
  //     });
  //   };
  //   initWorker();
  
  //   return () => {
  //     if (workerRef.current) {
  //       workerRef.current.terminate();
  //     }
  //   };
  // }, []);

  useEffect(() => {
    if (files.length > 0) {
      setSourceFiles(files);
    }
  }, [files]);

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
      const fileNames = option.map((file) => file.name).join(", ");
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

  // const handleTranslate = () => {
  //   if (selectedSourceFile === "") {
  //     toastError("Please select at least one source file.");
  //     return;
  //   }

  //   const selectedFile = sourceFiles.find(
  //     (file) => file.name === selectedSourceFile
  //   );

  //   if (selectedFile) {
  //     setFileType(selectedFile.type ?? "");

  //     if (selectedFile.type?.startsWith("image/")) {
  //       readImageText(selectedFile);
  //     } else {
  //       readPdfText(selectedFile);
  //     }
  //   } else {
  //     toastError("No file found with the selected.");
  //   }
  // };

  // const readPdfText = async (selectedImage: SourceFileData) => {
  //   if (!workerRef.current) return;
  
  //   try {
  //     setProcessing(true);
  //     setOcrStatus("Processing...");
  //     setProgress(0);
  //     setOcrResult([]);

  //     const pdf = await getDocument(selectedImage.url).promise;
  //     const numPages = pdf.numPages;

  //     for (let pageNum = 1; pageNum <= numPages; pageNum++) {
  //       const page = await pdf.getPage(pageNum); 
  //       const canvas = document.createElement('canvas');
  //       const context = canvas.getContext('2d');
  //       const viewport = page.getViewport({ scale: 1 });
  
  //       canvas.height = viewport.height;
  //       canvas.width = viewport.width;

  //       if (context) {
  //         await page.render({ canvasContext: context, viewport }).promise;
  //         const base64Image = canvas.toDataURL('image/jpeg', 0.5);
  //         const { data: { text } } = await workerRef.current.recognize(base64Image);
  
  //         setOcrResult(prev => [
  //           ...(prev || []),
  //           {
  //             page: pageNum,
  //             sourceFile: {
  //               ...selectedImage,
  //               url: base64Image,
  //             },
  //             ocrResult: text,
  //           },
  //         ]);
  
  //         setProgress(((pageNum - 1) + 1) / numPages);
  //       } else {
  //         throw new Error("Failed to get canvas context.");
  //       }
  //     }
      
  //     setOcrStatus("Completed");
  //   } catch (error) {
  //     console.error(error);
  //     setOcrStatus("Error occurred during processing.");
  //   } finally {
  //     setProcessing(false);
  //   }
  // };
  
  // const readImageText = async (selectedImage: SourceFileData) => {
  //   if (!workerRef.current) return;
  
  //   try {
  //     setProcessing(true);
  //     setOcrStatus("Processing...");
  //     setProgress(0);
  //     setOcrResult([]);
  
  //     // const resizedUrl = await resizeImage(selectedImage.url, 1000, 1000);
  //     setOcrResult([{
  //       page: 1,
  //       sourceFile: selectedImage
  //     }]);
      
  //     const { data: { text } } = await workerRef.current.recognize(selectedImage.url);
  //     setProgress(1);

  //     setOcrResult([{
  //       page: 1,
  //       sourceFile: selectedImage,
  //       ocrResult: text,
  //     }]);
  
  //     setOcrStatus("Completed");
  //   } catch (error) {
  //     console.error(error);
  //     setOcrStatus("Error occurred during processing.");
  //   } finally {
  //     setProcessing(false);
  //   }
  // };
  
  // const resizeImage = (url: string, maxWidth: number, maxHeight: number) => {
  //   return new Promise<string>((resolve) => {
  //     const img = new Image();
  //     img.src = url;
  //     img.onload = () => {
  //       const canvas = document.createElement("canvas");
  //       let width = img.width;
  //       let height = img.height;
  
  //       if (width > maxWidth || height > maxHeight) {
  //         const scale = Math.min(maxWidth / width, maxHeight / height);
  //         width *= scale;
  //         height *= scale;
  //       }
  
  //       canvas.width = width;
  //       canvas.height = height;
  //       const ctx = canvas.getContext("2d");
  //       ctx?.drawImage(img, 0, 0, width, height);
  //       resolve(canvas.toDataURL("image/jpeg", 0.7));
  //     };
  //   });
  // };
  
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
            className="px-4 py-2 border rounded-md w-full disabled:opacity-50 disabled:cursor-not-allowed"
            value={selectedSourceFile}
            onChange={(e) => setSelectedSourceFile(e.target.value)}
            disabled={processing}
          >
            <option value="">--- Please select source file ---</option>
            {sourceFiles?.map((file, index) => (
              <option key={index} value={file.name}>
                {file.name}
              </option>
            ))}
          </select>
        </div>
        {/* Translate Button */}
        {/* <div className="flex justify-end">
          <button
            onClick={handleTranslate}
            className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-44 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={processing}
          >
            {processing ? `Translating... ${Math.round(progress * 100)}%` : `Translate ${optionsLanguage.find(item => item.value === outputLanguage)?.label}`}
          </button>
        </div> */}
      </div>

      {/* Source and Result Sections */}
      {selectedSourceFile && (
        <>
          <div className="grid grid-cols-2 gap-6 mt-2">
            <h2 className="text-black text-lg font-bold flex items-center justify-center">Source</h2>
            <h2 className="text-black text-lg font-bold flex items-center justify-center">Result</h2>
          </div>
          <div className="h-[calc(100vh-240px)] overflow-y-auto -mr-4">
            {files
              .filter((item) => item.name === selectedSourceFile)
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
                            {processing ? (
                              <p className="p-4">{ocrStatus}</p>
                            ) : item ? (
                              // <PreviewFile fileData={item.file ?? null} />
                              <img
                                src={page.blobUrl}
                                alt="Preview"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <p className="text-gray-500">No file selected</p>
                            )}
                          </div>
                        </div>

                        {/* Result Section */}
                        <div>
                          <div className="mr-4 bg-white rounded-lg shadow-md h-[calc(100vh-293px)]">
                            {processing ? (
                              <p className="p-4">{ocrStatus}</p>
                            ) : item ? (
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