"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from 'react-redux';

import SourceFileTable from "../../components/ocr/SourceFileTable";
import PreviewFile from "../../components/ocr/PreviewFile";

import useToast from "../../hooks/useToast";
import useOcrWorker from '../../hooks/useOcrWorker';

import { convertToBase64, convertBase64ToBlobUrl } from '../../utils/file';
import { convertFileSizeToMB } from "../../utils/format";
import { SourceFileData, OcrResult } from "../../interface/file"

import { selectAllSourceFiles } from '../../redux/selectors/fileSelectors';
import { addFiles, clearFiles } from '../../redux/actions/fileActions';
import { readTextFromFile } from '../../lib/ocr';
import { optionsLanguage } from '../../constants/languages';

export default function ReadingPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const workerRef = useOcrWorker();
  const { toastSuccess, toastError } = useToast();

  const files = useSelector(selectAllSourceFiles);
  const [sourceFiles, setSourceFiles] = useState<SourceFileData[]>([]);
  
  // const [inputLanguage, setInputLanguage] = useState("eng");
  // const [outputLanguage, setOutputLanguage] = useState("eng");

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [filePreview, setFilePreview] = useState<SourceFileData | null>(null);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  // const [ocrResult, setOcrResult] = useState<OcrResult[] | null>(null);

  // Handlers for Add
  const handleAdd = () => {
    fileRef.current?.click();
  };

  // Handlers for Delete
  const handleDeleteFile = (index: number) => {
    const updatedFiles = [...sourceFiles];
    const removedFile = updatedFiles.splice(index, 1)[0];
    setSourceFiles(updatedFiles);
    toastSuccess(`Removed file: ${removedFile.name}`);
  };

  // Handlers for PreviewFile
  const handlePreviewFile = (file: SourceFileData) => {
    setFilePreview(file);
  };

  // Handlers for FileChange
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    // setLoading(true);

    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      toastError("No files selected.");
      // setLoading(false);
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
        base64Data: base64Image,
        blobUrl: URL.createObjectURL(file),
      };

      newFilesData.push(newFileData);
    }

    if (newFilesData.length > 0) {
      const updatedFiles = [...sourceFiles, ...newFilesData];
      setSourceFiles(updatedFiles);
    }

    toastSuccess(`${newFilesData.length} file(s) added successfully.`);
    e.target.value = "";
    // setLoading(false);
  };
  
  // Handlers for StartProcess
  const handleStartProcess = async () => {
    if (!sourceFiles || sourceFiles.length === 0) {
      toastError("No source file.");
      // setLoading(false);
      return;
    }
  
    try {
      setProcessing(true);
  
      for (let i = 0; i < sourceFiles.length; i++) {
        const selectedFile = sourceFiles[i];
  
        if (!workerRef.current) {
          toastError("OCR worker not ready.");
          break;
        }
  
        const ocrResultForFile = await readTextFromFile(
          workerRef.current,
          selectedFile,
          setProgress
        );
  
        dispatch(addFiles([ocrResultForFile]));
      }
  
      toastSuccess("OCR Processing completed.");
      router.push('/reading/process');
    } catch (error) {
      console.error("Error during OCR processing", error);
      toastError("Error during OCR processing.");
    } finally {
      setProcessing(false);
      // setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[100%] p-4 bg-gray-100">
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
              accept=".pdf,.png,.jpg,image/*"
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
                value={inputLanguage}
                onChange={(e) => {
                  dispatch(setInputLanguage(e.target.value));
                  dispatch(setOutputLanguage(e.target.value));
                }}
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
      {/* {processing && (
        <div className="flex items-center justify-center mt-10">
          <div className="progress-bar">
            {progress && <progress value={progress * 100} max="100">{progress * 100}%</progress>}
            {progress && <p>{Math.round(progress * 100)}% Complete</p>}
          </div>
        </div>
      )} */}
      {processing && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center w-[400px]">
            <div className="flex flex-col items-center">
              {/* Loading Text */}
              <div className="text-xl font-bold mb-1">Processing, please wait...</div>
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
            <div className="relative w-full bg-gray-200 rounded-full">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 mt-2">{Math.round(progress * 100)}%</div>
          </div>
        </div>
      )}

    </div>
  );
}
