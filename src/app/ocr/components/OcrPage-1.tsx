"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from 'react-redux';
// import useOcrWorker from '@/app/hooks/useOcrWorker';
import useToast from "@/app/hooks/useToast";
import { convertBase64ToBlobUrl } from '@/app/utils/file';
import { convertFileSizeToMB } from "@/app/utils/format";
import { SourceFileData, OcrRequest } from "@/app/interface/file"
import { selectAllSourceFiles } from '@/app/redux/selectors/fileSelectors';
import { addFiles, updateFiles, clearFiles } from '@/app/redux/actions/fileActions';
import { callOcrApi } from '@/app/actions/ocr';
import SourceFileTable from "@/app/components/ocr/SourceFileTable";
import PreviewFile from "./PreviewFile";

export default function OcrPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { toastSuccess, toastError } = useToast();
  const sourceFiles = useSelector(selectAllSourceFiles);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [filePreview, setFilePreview] = useState<SourceFileData | null>(null);
  const [processing, setProcessing] = useState(false);
  // const [progress, setProgress] = useState<number>(0);
  // const workerRef = useOcrWorker();

  useEffect(() => {
      const currentPath = pathname;
      return () => {
        if (currentPath === "/ocr") {
          dispatch(clearFiles());
        }
      };
    }, [pathname]);

  // Handlers for Add
  const handleAdd = () => {
    fileRef.current?.click();
  };

  // Handlers for Delete
  const handleDeleteFile = (index: number) => {
    const updatedFiles = [...sourceFiles];
    const removedFile = updatedFiles.splice(index, 1)[0];
    // setSourceFiles(updatedFiles);
    // toastSuccess(`Removed file: ${removedFile.name}`);
  };

  // Handlers for PreviewFile
  const handlePreviewFile = (file: SourceFileData) => {
    setFilePreview(file);
  };

  // // Handlers for FileChange
  // const handleFileChange_ = async (e: ChangeEvent<HTMLInputElement>) => {
  //   const selectedFiles = e.target.files;

  //   if (!selectedFiles || selectedFiles.length === 0) {
  //     toastError("No files selected.");
  //     return;
  //   }

  //   const allowedExtensions = ["pdf", "png", "jpg", "jpeg"];
  //   const maxSizeMB = 10;
  //   const newFilesData: SourceFileData[] = [];
  //   const selectedFilesArray: File[] = [...selectedFiles]

  //   for (let i = 0; i < selectedFilesArray.length; i++) {
  //     const file = selectedFilesArray[i];
  //     const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
  //     const fileSizeInMB = convertFileSizeToMB(file.size);

  //     if (!allowedExtensions.includes(fileExtension)) {
  //       toastError(`Invalid file type for ${file.name}. Only PDF, PNG, JPG, and JPEG are allowed.`);
  //       continue;
  //     }

  //     if (parseFloat(fileSizeInMB) > maxSizeMB) {
  //       toastError(`File ${file.name} is too large. Max size is ${maxSizeMB} MB.`);
  //       continue;
  //     }

  //     const base64Image = fileExtension === "pdf" ? "" : await convertToBase64(file);

  //     const newFileData: SourceFileData = {
  //       id: selectedFilesArray.length + 1,
  //       fileName: file.name,
  //       fileType: file.type,
  //       fileSize: file.size,
  //       base64Data: base64Image,
  //       blobUrl: URL.createObjectURL(file),
  //     };

  //     newFilesData.push(newFileData);
  //   }

  //   if (newFilesData.length > 0) {
  //     // const updatedFiles = [...sourceFiles, ...newFilesData];
  //     // setSourceFiles(updatedFiles);
  //     dispatch(addFiles(newFilesData));
  //     toastSuccess(`${newFilesData.length} file(s) added successfully.`);
  //   }

  //   e.target.value = "";
  // };

  // // Handlers for StartProcess
  // const handleStartProcess_ = async () => {
  //   if (!sourceFiles || sourceFiles.length === 0) {
  //     toastError("No source file.");
  //     return;
  //   }
  
  //   try {
  //     setProcessing(true);
  
  //     for (let i = 0; i < sourceFiles.length; i++) {
  //       const selectedFile = sourceFiles[i];
  
  //       if (!workerRef.current) {
  //         toastError("OCR worker not ready.");
  //         break;
  //       }
  
  //       const ocrResult = await readTextFromFile(
  //         workerRef.current,
  //         selectedFile,
  //         setProgress
  //       );
  
  //       dispatch(updateFile(ocrResult));
  //     }
  
  //     toastSuccess("OCR Processing completed.");
  //     router.push('/ocr/process');
  //   } catch (error) {
  //     console.error("Error during OCR processing", error);
  //     toastError("Error during OCR processing.");
  //   } finally {
  //     setProcessing(false);
  //   }
  // };

  // Handlers for FileChange
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    if (files.length === 0) {
      toastError("No files selected.");
      return;
    }

    const allowedExtensions = ["pdf", "png", "jpg", "jpeg"];
    const maxSizeMB = 10;
    const allResults: SourceFileData[] = [];

    for (const file of files) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      const fileSizeInMB = convertFileSizeToMB(file.size);

      if (!allowedExtensions.includes(fileExtension)) {
        toastError(`Invalid file type for ${file.name}. Only PDF, PNG, JPG, and JPEG are allowed.`);
        continue;
      }

      if (parseFloat(fileSizeInMB) > maxSizeMB) {
        toastError(`File ${file.name} is too large. Max size is ${maxSizeMB} MB.`);
        continue;
      }

      const base64Data = await readFileAsBase64(file);

      const rawResult: SourceFileData = {
        id: Date.now(),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        base64Data: base64Data,
        blobUrl: convertBase64ToBlobUrl(base64Data),
      };

      allResults.push(rawResult);
    }

    if (allResults.length > 0) {
      dispatch(addFiles(allResults));
      toastSuccess(`${allResults.length} file(s) added successfully.`);
    }

    e.target.value = "";
  };
   
  // Handlers for StartProcess
  const handleStartProcess = async () => {
    if (!sourceFiles || sourceFiles.length === 0) {
      toastError("No source file.");
      return;
    }
  
    try {
      setProcessing(true);
  
      const ocrRequest: OcrRequest[] = sourceFiles?.map(file => ({
        fileName: file.fileName,
        fileType: file.fileType,
        base64Data: file.base64Data,
      })) ?? [];

      const rawResult: SourceFileData[] = await callOcrApi(ocrRequest);

      dispatch(clearFiles());

      const ocrResult = rawResult.map((item) => ({
        ...item,
        ocrResult: item.ocrResult?.map((page) => ({
          ...page,
          blobUrl: page.base64Image ? convertBase64ToBlobUrl(page.base64Image) : '',
        })) ?? [],
      }));
      
      await dispatch(addFiles(ocrResult)); 
  
      toastSuccess("OCR Processing completed.");
      router.push('/ocr/process');
    } catch (error) {
      console.error("Error during OCR processing", error);
      toastError("Error during OCR processing.");
    } finally {
      setProcessing(false);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  return (
    <div className="flex flex-col p-2">
      {/* <h2 className="text-2xl font-bold">OCR Reading</h2> */}

      {/* Source Add Button && Input Language Selection */}
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Source Add Button */}
        <div className="flex flex-col">
          <div className="mb-4 space-x-2">
            <button
              onClick={handleAdd}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-24"
            >
              Add
            </button>
            <input
              multiple
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jepg"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
        {/* Input Language Selection && Start Process */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            {/* <div className="flex items-center space-x-2 w-4/5">
              <label className="text-sm font-medium whitespace-nowrap" htmlFor="language-select">
                Input Language Selection
              </label>
              <select
                id="language-select"
                className="px-4 py-2 border rounded-md w-full text-sm"
              >
                {optionsLanguage.map((lang, index) => (
                  <option key={index} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div> */}
            <button
              onClick={handleStartProcess}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-38 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={processing}
            >
              {processing ? `Processing...` : `Start Process`}
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
              sourceFiles ={sourceFiles}
              onPreview={handlePreviewFile}
              // onDelete={handleDeleteFile}
              // onEdit={handleOpenEditModal}
            />
          </div>
        </div>
        {/* Preview Section */}
        <div className="flex-1">
          <h2 className="text-black text-lg font-bold">Preview</h2>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center h-[calc(100vh-200px)]">
            <PreviewFile url={filePreview?.blobUrl} type={filePreview?.fileType} />
          </div>
        </div>
      </div>

      {/* processing */}
      {processing && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center w-[400px]">
            <div className="flex flex-col items-center">
              {/* Loading Text */}
              <div className="text-xl font-bold mb-5">Processing, please wait...</div>
              {/* Image Spinner */}
              <Image
                src="/images/spinner.gif"
                alt=""
                width={70}
                height={70}
                className="mb-1 animate-spin"
              />
            </div>
            {/* Progress Bar */}
            {/* <div className="relative w-full bg-gray-200 rounded-full">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 mt-2">{Math.round(progress * 100)}%</div> */}
          </div>
        </div>
      )}

      {/* {processing && (
        <div className="flex items-center justify-center mt-10">
          <div className="progress-bar">
            {progress && <progress value={progress * 100} max="100">{progress * 100}%</progress>}
            {progress && <p>{Math.round(progress * 100)}% Complete</p>}
          </div>
        </div>
      )} */}
    </div>
  );
}
