"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import useToast from "@/app/hooks/useToast";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from 'react-redux';
import { readFileAsBase64, convertBase64ToBlobUrl } from '@/app/lib/utils/file';
import { convertFileSizeToMB } from "@/app/lib/utils/format";
import { selectAllAccountingFiles } from '@/app/store/file/fileSelectors';
import { addAccountingFiles, clearAccountingFiles } from '@/app/store/file/accountingFileActions';
import AccountingSourceFileTable from "@/app/components/Accounting/AccountingSourceFileTable";
import PreviewFile from "@/app/components/ocr/PreviewFile";
import Processing from "@/app/components/processing/Processing";
import { SourceFileData, ParamOcrRequest } from "@/app/lib/interfaces"
import { accountingOcrReader } from '@/app/lib/api/accounting-ocr';

export default function AccountingPage() {
  const { toastSuccess, toastError, toastInfo, toastWarning } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();
  const sourceFiles = useSelector(selectAllAccountingFiles);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [filePreview, setFilePreview] = useState<SourceFileData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

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


    if (files.length > 1) {
      toastWarning(`Selected ${files.length} files - System will process one by one to save GPU memory`);
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

      try {
        const base64Data = await readFileAsBase64(file);
        
        console.log(`File: ${file.name}, Size: ${file.size} bytes`);

        const rawResult: SourceFileData = {
          id: Date.now() + Math.random(),
          fileName: file.name,
          fileType: file.type,
          base64Data: base64Data,
          blobUrl: fileExtension === "pdf" ? URL.createObjectURL(file) : convertBase64ToBlobUrl(base64Data),
        };

        allResults.push(rawResult);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        toastError(`Failed to process ${file.name}. ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (allResults.length > 0) {

      dispatch(addAccountingFiles(allResults));
      toastSuccess(`Added ${allResults.length} file(s) successfully`);
      
 
      if (allResults.length > 1) {
        toastInfo(`${allResults.length} files in queue - Will process one by one to prevent GPU memory overflow`);
      }
    }

    e.target.value = "";
  };


  const handleStartProcess = async () => {
    if (!sourceFiles || sourceFiles.length === 0) {
      toastError("No source file.");
      return;
    }

    try {
      setProcessing(true);
      
  
      await processAccountingOcr();
      
      toastSuccess("Accounting OCR processing completed.");
      

      router.push('/accounting/summary');
      
    } catch (error) {
      console.error("Error during Accounting OCR processing", error);
      toastError("Failed to process Accounting OCR. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const processAccountingOcr = async () => {
    try {

      const param: ParamOcrRequest[] = sourceFiles?.map(file => ({
        fileName: file.fileName,
        fileType: file.fileType,
        base64Data: file.base64Data,
      })) ?? [];
    
      console.log("Accounting OCR Request:", param); 
      

      const response: SourceFileData[] = await accountingOcrReader(param);
      console.log("Accounting OCR Result:", response); 


      const ocrResult = response?.map((file) => ({
        ...file,
        blobUrl: file.base64Data ? convertBase64ToBlobUrl(file.base64Data) : '',
        ocrResult: file.ocrResult?.map((page) => ({
          ...page,
          blobUrl: page.base64Data ? convertBase64ToBlobUrl(page.base64Data) : '',
        })) ?? [],
      }));

      dispatch(clearAccountingFiles()); 
      dispatch(addAccountingFiles(ocrResult)); 

      return ocrResult;
      
    } catch (error) {
      console.error("[Accounting OCR] Failed during processAccountingOcr:", error);
      throw error;
    }
  };
  
  return (
    <div className="flex flex-col p-2 h-full">
      {/* Source Add Button */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Source Add Button */}
        <div className="flex flex-col">
          <div className="mb-4 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 w-full">
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
        {/* Start Process */}
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
              <AccountingSourceFileTable 
                sourceFiles={sourceFiles} 
                onPreview={handlePreviewFile} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
              />
            </div>
          </div>
          {/* PreviewFile Section */}
          <div className="border rounded-xl shadow-md p-4 flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              <PreviewFile 
                key={filePreview?.id}
                type={filePreview?.fileType} 
                url={filePreview?.blobUrl} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* processing */}
      {processing && (<Processing/>)}
      
    </div>
  );
}