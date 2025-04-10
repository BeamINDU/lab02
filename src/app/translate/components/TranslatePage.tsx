"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useToast from "../../hooks/useToast";

import { useDispatch, useSelector } from 'react-redux';
import { addFiles, clearFiles } from '../../redux/actions';
// import { setInputLanguage, setOutputLanguage, setFiles, addFile, removeFile, updateFile } from '../../store/slices/fileSlice';
// import { RootState } from '../../store/store';

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

import ImageEditModal, { AdjustmentValues } from "../../components/ocr/ImageEditModal";
import SourceFileTable from "../../components/ocr/SourceFileTable";
import PreviewFile from "../../components/ocr/PreviewFile";
import ConfirmModal from "../../components/modal/ConfirmModal";

import { convertFileSizeToMB } from "../../utils/format";
import { SourceFileData, OcrResult } from "../../interface/file"


export default function TranslatePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // const files = useSelector((state: RootState) => state.files.files);
  // const inputLanguage = useSelector((state: RootState) => state.files.input_language);
  // const outputLanguage = useSelector((state: RootState) => state.files.output_language);
  const [sourceFiles, setSourceFiles] = useState<SourceFileData[]>([]);
  const [ocrResult, setOcrResult] = useState<OcrResult[] | null>(null);
  const [inputLanguage, setInputLanguage] = useState("eng");
  const [outputLanguage, setOutputLanguage] = useState("eng");

  const { toastSuccess, toastError } = useToast();
  const [loading, setLoading] = useState(false);

  const imageRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [filePreview, setFilePreview] = useState<SourceFileData | null>(null);

  const [fileToDeleteIndex, setFileToDeleteIndex] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<SourceFileData | undefined>(undefined);
  const [adjustedValues, setAdjustedValues] = useState<AdjustmentValues | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditImageModalOpen, setEditImageModalOpen] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const workerRef = useRef<Tesseract.Worker | null>(null);

  const optionsLanguage = [
    { label: 'English', value: 'eng' },
    { label: 'Japanese', value: 'jpn' },
    { label: 'Thai', value: 'tha' },
  ];
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';
    }
    const initWorker = async () => {
      workerRef.current = await createWorker("eng", 1, {
        logger: (m) => console.log(m),
      });
    };
    initWorker();
  
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);
  

  // Handlers for Browse
  const handleBrowse = () => {
    fileRef.current?.click();
  };

  // Handlers for Camera
  const handleCamera = () => {
    imageRef.current?.click();
  };

  // Handlers for Delete
  const handleDeleteFile = (index: number) => {
    const updatedFiles = [...sourceFiles];
    const removedFile = updatedFiles.splice(index, 1)[0];
    setSourceFiles(updatedFiles);
    toastSuccess(`Removed file: ${removedFile.name}`);
  };

  // Handlers for ImageEditModal
  // const handleOpenEditModal = (file: SourceFileData) => {
  //   setSelectedFile(file);
  //   setEditImageModalOpen(true);
  // };

  // const handleSaveEdit = (values: AdjustmentValues) => {
  //   setAdjustedValues(values);
  //   toastSuccess(`Adjusted values saved for file: ${selectedFile?.fileName}`);
  //   setEditImageModalOpen(false);
  // };

  // Handlers for Delete
  // const handleDeleteFile = (index: number) => {
  //   setFileToDeleteIndex(index);
  //   setIsDeleteModalOpen(true);
  // };

  // const confirmDeleteFile = () => {
  //   if (fileToDeleteIndex !== null) {
  //     const deletedFile = files[fileToDeleteIndex];
  //     dispatch(setFiles(files.filter((_, i) => i !== fileToDeleteIndex)));
  //     toastSuccess(`File ${deletedFile.fileName} deleted successfully`);
  //   }
  //   setFileToDeleteIndex(null);
  //   setIsDeleteModalOpen(false);
  // };

  // Handlers for PreviewFile
  const handlePreviewFile = (file: SourceFileData) => {
    setFilePreview(file);
  };

  // Handlers for FileChange
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);

    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      toastError("No files selected.");
      setLoading(false);
      return;
    }

    const allowedExtensions = ["pdf", "png", "jpg"];
    const maxSizeMB = 10;
    const newFilesData: SourceFileData[] = [];
    const selectedFilesArray: File[] = [...selectedFiles]

    for (let i = 0; i < selectedFilesArray.length; i++) {
      const file = selectedFilesArray[i];
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      const fileSizeInMB = convertFileSizeToMB(file.size);

      if (!allowedExtensions.includes(fileExtension)) {
        toastError(`Invalid file type for ${file.name}. Only PDF, PNG, and JPG are allowed.`);
        continue;
      }

      if (parseFloat(fileSizeInMB) > maxSizeMB) {
        toastError(`File ${file.name} is too large. Max size is ${maxSizeMB} MB.`);
        continue;
      }

      const base64Image = fileExtension === "pdf" ? "" : await convertToBase64(file);

      const newFileData: SourceFileData = {
        id: selectedFilesArray.length + 1,
        name: file.name,
        type: file.type,
        size: file.size,
        rawFile: file,
        url: URL.createObjectURL(file),
        base64: base64Image
      };

      newFilesData.push(newFileData);
    }

    if (newFilesData.length > 0) {
      const updatedFiles = [...sourceFiles, ...newFilesData];
      setSourceFiles(updatedFiles);
    }

    toastSuccess(`${newFilesData.length} file(s) added successfully.`);
    e.target.value = "";
    setLoading(false);
  };

  // Handlers for OCR
  const handleOcr = () => {
    const sampleFiles: SourceFileData[] = [
      {
        id: 1,
        name: "example.pdf",
        type: "application/pdf",
        size: 1048576,
        rawFile: new File(["dummy pdf content"], "example.pdf", { type: "application/pdf" }),
        url: "blob:http://localhost:3000/aaaa-bbbb-cccc",
        base64: "",
        ocrResult: [
          {
            page: 1,
            extractedText: "First page of PDF.",
            base64Image: "data:image/png;base64,...",
            blobUrl: "blob:http://localhost:3000/1234-pdf-page1"
          },
          {
            page: 2,
            extractedText: "Second page of PDF.",
            base64Image: "data:image/png;base64,...",
            blobUrl: "blob:http://localhost:3000/1234-pdf-page2"
          }
        ]
      }
    ];

    dispatch(clearFiles());

    if (sampleFiles.length > 0) {
       // 1. Set source files for UI preview
      // const updatedFiles = sampleFiles.map(file => file);
      setSourceFiles(sampleFiles); // setSourceFiles(prev => [...prev, ...updatedFiles]);

      // 2. Dispatch to Redux
      dispatch(addFiles(sampleFiles));
    }
  };

  // Handlers for StartProcess
  const handleStartProcess = async () => {
    if (!sourceFiles || sourceFiles.length === 0) {
      toastError("No source file.");
      setLoading(false);
      return;
    }

    try {
      // Iterate over each file in sourceFiles and process them
      

      for (let i = 0; i < sourceFiles.length; i++) {
        const selectedFile = sourceFiles[i];
        await readText(selectedFile);
      }
      
      toastSuccess("OCR Processing completed.");
      router.push('/translate/process');
    } catch (error) {
      console.error("Error during OCR processing", error);
      toastError("Error during OCR processing.");
    } finally {
      setLoading(false);
    }
  };

  const readText = async (selectedFile: SourceFileData) => {
    if (!workerRef.current) return;
  
    try {
      setProcessing(true);
      // setOcrStatus("Processing...");
      setProgress(0);
      // setOcrResult([]);
  
      const newSourceFileData: SourceFileData[] = []; // To hold results for dispatch
  
      if (selectedFile.type?.startsWith("image/")) {
        // If it's an image, use the image OCR process
        const { data: { text } } = await workerRef.current.recognize(selectedFile.url);

        const ocrResultForFile: SourceFileData = {
          ...selectedFile,
          ocrResult: [{ 
            page: 1, 
            extractedText: text ,
            base64Image: selectedFile.base64,
            blobUrl: selectedFile.url
          }],
        };
  
        newSourceFileData.push(ocrResultForFile);
      } else {
        // If it's a PDF, use the PDF OCR process
        const pdf = await getDocument(selectedFile.url).promise;
        const numPages = pdf.numPages;
        const pageOcrResult: OcrResult[] = [];
  
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const viewport = page.getViewport({ scale: 1 });
  
          canvas.height = viewport.height;
          canvas.width = viewport.width;
  
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
  
            const base64Image = canvas.toDataURL(selectedFile.type, 0.5);
            const blobUrl = base64ToBlobUrl(base64Image, selectedFile.type);
  
            const { data: { text } } = await workerRef.current.recognize(base64Image);
  
            const ocrResultForPage: OcrResult = {
              page: pageNum,
              extractedText: text,
              base64Image: base64Image,
              blobUrl: blobUrl
            };
            pageOcrResult.push(ocrResultForPage);
          } else {
            throw new Error("Failed to get canvas context.");
          }
  
          // Update progress after each page
          setProgress(((pageNum - 1) + 1) / numPages);
        }

        const ocrResultForFile: SourceFileData = {
          ...selectedFile,
          ocrResult: pageOcrResult,
        };
        newSourceFileData.push(ocrResultForFile);
      }
      
      // Dispatch the OCR results to Redux
      dispatch(addFiles(newSourceFileData));
      // setOcrStatus("Completed");
    } catch (error) {
      console.error("OCR processing failed", error);
      // setOcrStatus("Error occurred during processing.");
    } finally {
      setProcessing(false);
    }
  };

  // Helper function to convert an image file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result as string);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file); 
    });
  };

  const base64ToBlobUrl = (base64: string, mimeType: string): string => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays: number[] = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset++) {
      const byte = byteCharacters.charCodeAt(offset);
      byteArrays.push(byte); 
    }
  
    const byteArray = new Uint8Array(byteArrays);
    const blob = new Blob([byteArray], { type: mimeType });
  
    return URL.createObjectURL(blob);
  };

  return (
    <div className="flex flex-col h-[100%] p-4 bg-gray-100">
      {/* Source Button && Language Selection & */}
      <div className="grid grid-cols-3 gap-4 h-full">
        <div className="flex flex-col col-span-1">
          <div className="mb-4 flex space-x-2 w-full">
            <button
              onClick={handleBrowse}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-24"
            >
              BROWSE
            </button>
            <button
              onClick={handleCamera}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-24"
            >
              Camera
            </button>
            <button
              onClick={handleOcr}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-24"
            >
              OCR
            </button>
            <input
              multiple
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
        <div className="flex flex-col col-span-2">
          <div className="flex items-center justify-between mb-4 w-full">
            <div className="flex items-center space-x-2 w-full md:w-2/5">
              <label className="text-sm font-medium whitespace-nowrap" htmlFor="language-select">
                Input Language Selection
              </label>
              <select
                id="language-select"
                className="px-4 py-2 border rounded-md w-full text-sm"
                value={inputLanguage}
                onChange={(e) => setInputLanguage(e.target.value)}
              >
                {optionsLanguage.map((lang, index) => (
                  <option key={index} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2 w-full md:w-2/5">
              <label className="text-sm font-medium whitespace-nowrap" htmlFor="language-select">
                Output Language Selection
              </label>
              <select
                id="language-select"
                className="px-4 py-2 border rounded-md w-full text-sm"
                value={outputLanguage}
                onChange={(e) => setOutputLanguage(e.target.value)}
              >
                {optionsLanguage.map((lang, index) => (
                  <option key={index} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleStartProcess}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-full md:w-32"
            >
              Start Process
            </button>
          </div>
        </div>
      </div>
      {/* Source File Section && Preview Section */}
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Source File Section */}
        <div className="flex flex-col">
          <div className="">
            <h2 className="text-black text-lg font-bold">Source File</h2>
            <SourceFileTable
              fileData={sourceFiles}
              onPreview={handlePreviewFile}
              onDelete={handleDeleteFile}
              // onEdit={handleOpenEditModal}
            />
          </div>
        </div>
        {/* Preview Section */}
        <div className="flex-1">
          <h2 className="text-black text-lg font-bold">Preview</h2>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center h-[calc(100vh-200px)]">
              <PreviewFile fileData={filePreview ?? null} />
          </div>
        </div>
      </div>

      {/* <ImageEditModal
        isOpen={isEditImageModalOpen}
        onClose={() => setEditImageModalOpen(false)}
        imageSrc={selectedFile ? selectedFile.url : ""}
        onSave={handleSaveEdit}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete File"
        message={`Are you sure you want to delete this file ${fileToDeleteIndex !== null ? files[fileToDeleteIndex]?.fileName : ""
          }?`}
        actions={[
          { label: "NO", onClick: () => setIsDeleteModalOpen(false) },
          { label: "YES", onClick: confirmDeleteFile },
        ]}
      /> */}
    </div>
  );
}
