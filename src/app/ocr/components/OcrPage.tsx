"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import useToast from "@/app/hooks/useToast";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from 'react-redux';
import { readFileAsBase64, convertBase64ToBlobUrl } from '@/app/utils/file';
import { convertFileSizeToMB } from "@/app/utils/format";
import { SourceFileData, OcrRequest } from "@/app/interface/file"
import { selectAllSourceFiles } from '@/app/redux/selectors/fileSelectors';
import { addFiles, clearFiles } from '@/app/redux/actions/fileActions';
import { submitOcrRequest } from '@/app/actions/ocr';
import SourceFileTable from "@/app/components/ocr/SourceFileTable";
import PreviewFile from "@/app/components/ocr/PreviewFile";
import ExportExcelFromText from "@/app/components/export/ExportExcelFromText";

export default function OcrPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const { toastSuccess, toastError } = useToast();

  const fileRef = useRef<HTMLInputElement | null>(null);
  const sourceFiles = useSelector(selectAllSourceFiles);

  const [filePreview, setFilePreview] = useState<SourceFileData | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // useEffect(() => {
  //   console.log("filePreview updated:", filePreview);
  // }, [filePreview]);

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

  // Handlers for Edit
  const handleEdit = (id: number) => {
    const fileToUpdate = sourceFiles.find(file => file.id === id);
    if (!fileToUpdate) return;
  
    if (filePreview?.id === fileToUpdate.id) {
      setFilePreview(null);
      // setFilePreview(fileToUpdate);
    }

  };

  // Handlers for Delete
  const handleDelete = (id: number) => {
    const fileToDelete = sourceFiles.find(file => file.id === id);
    if (!fileToDelete) return;
  
    if (filePreview?.id === fileToDelete.id) {
      setFilePreview(null);
    }
    
  };

  // Handlers for PreviewFile
  const handlePreviewFile = (file: SourceFileData) => {
    setFilePreview(file);
  };

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
        // blobUrl: convertBase64ToBlobUrl(base64Data),
        blobUrl: URL.createObjectURL(file),
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

      const rawOrcResult: SourceFileData[] = await submitOcrRequest(ocrRequest);

      dispatch(clearFiles());

      const ocrResult = rawOrcResult.map((item) => ({
        ...item,
        blobUrl: item.base64Data ? convertBase64ToBlobUrl(item.base64Data) : '',
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
  
  return (
    <div className="flex flex-col p-2 h-full">
      {/* Source Add Button && Input Language Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Source Add Button */}
        <div className="flex flex-col">
          <div className="mb-4 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 w-full">
            {/* <ExportExcelFromText/> */}
            
            <button
              onClick={handleAdd}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-full sm:w-24"
            >
              Add
            </button>
            <input
              multiple
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
        {/* Input Language Selection & Start Process */}
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4 w-full">
            <button
              onClick={handleStartProcess}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-full md:w-auto md:ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={processing}
            >
              {processing ? `Processing...` : `Start Process`}
            </button>
          </div>
        </div>
      </div>

      {/* Source File Section && Preview Section */}
      <div className="h-full flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 h-full">
          {/* SourceFileTable Section */}
          <div className="border rounded-xl shadow-md p-4 flex flex-col h-full">
            <h2 className="text-lg font-bold text-black mb-2">Source File</h2>
            <div className="flex-1 max-h-[76vh] overflow-auto">
              <SourceFileTable 
                sourceFiles={sourceFiles} 
                onPreview={handlePreviewFile} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
          {/* PreviewFile Section */}
          <div className="border rounded-xl shadow-md p-4 flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              <PreviewFile 
                key={filePreview?.blobUrl}
                url={filePreview?.blobUrl} 
                type={filePreview?.fileType} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* processing */}
      {processing && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center w-[400px]">
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold mb-5">Processing, please wait...</div>
              <Image
                src="/images/spinner.gif"
                alt=""
                width={70}
                height={70}
                className="mb-1 animate-spin"
              />
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
