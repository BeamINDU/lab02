// src/app/(protected)/accounting/components/accountingPage.tsx
"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import useToast from "@/app/hooks/useToast";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from 'react-redux';
import { readFileAsBase64, convertBase64ToBlobUrl, validateBase64, getBase64Size, resizeImage, shouldResizeImage, formatFileSize } from '@/app/lib/utils/file';
import { convertFileSizeToMB } from "@/app/lib/utils/format";
import { SourceFileData, ParamOcrRequest } from "@/app/lib/interfaces"
import { selectAllSourceFiles } from '@/app/store/file/fileSelectors';
import { addFiles, clearFiles } from '@/app/store/file/fileActions';
import SourceFileTable from "@/app/components/ocr/SourceFileTable";
import PreviewFile from "@/app/components/ocr/PreviewFile";
import Processing from "@/app/components/processing/Processing";

// Interface สำหรับข้อมูลที่ได้จาก Accounting OCR API
interface AccountingOcrResponse {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  base64Data: string;
  ocrResult: Array<{
    page: number;
    language: string;
    base64Data: string;
    extractedText: string;
    reportData: {
      invoiceDate: string;
      invoiceNo: string;
      sellerName: string;
      sellerTaxId: string;
      branch: string;
      productValue: string;
      vat: string;
      totalAmount: string;
    };
  }>;
}

export default function AccountingPage() {
  const { toastSuccess, toastError, toastInfo, toastWarning } = useToast();
  const router = useRouter();
  const dispatch = useDispatch();
  const sourceFiles = useSelector(selectAllSourceFiles);
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

  // Handlers for FileChange - เพิ่มการ validate base64
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

      try {
        let processedFile = file;

        // ถ้าเป็นรูปภาพและขนาดใหญ่เกินไป ให้ลดขนาด
        if (file.type.startsWith('image/') && shouldResizeImage(file, 0.5)) {
          console.log(`Resizing ${file.name} (${formatFileSize(file.size)}) to reduce GPU memory usage...`);
          
          try {
            processedFile = await resizeImage(file, 800, 800, 0.7);
            console.log(`Resized to: ${formatFileSize(processedFile.size)}`);
            toastInfo(`Resized ${file.name} to reduce processing load`);
          } catch (resizeError) {
            console.warn(`Failed to resize ${file.name}, using original:`, resizeError);
            toastWarning(`Could not resize ${file.name}, using original size`);
          }
        }

        const base64Data = await readFileAsBase64(processedFile);
        
        // ตรวจสอบ base64 ที่ได้
        if (!validateBase64(base64Data)) {
          toastError(`Failed to encode ${file.name}. Invalid base64 format.`);
          continue;
        }

        const base64Size = getBase64Size(base64Data);
        console.log(`File: ${file.name}, Original: ${file.size} bytes, Processed: ${processedFile.size} bytes, Base64: ${base64Size} bytes`);

        const rawResult: SourceFileData = {
          id: Date.now() + Math.random(), // ป้องกัน ID ซ้ำ
          fileName: file.name,
          fileType: processedFile.type,
          base64Data: base64Data,
          blobUrl: fileExtension === "pdf" ? URL.createObjectURL(processedFile) : convertBase64ToBlobUrl(base64Data),
        };

        allResults.push(rawResult);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        toastError(`Failed to process ${file.name}. ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (allResults.length > 0) {
      dispatch(addFiles(allResults));
      toastSuccess(`${allResults.length} file(s) added successfully.`);
    }

    e.target.value = "";
  };
   
  // ฟังก์ชันสำหรับทดสอบ base64 encoding
  const testBase64Encoding = async () => {
    console.log('Testing base64 encoding...');
    
    for (const file of sourceFiles) {
      try {
        console.log(`Testing file: ${file.fileName}`);
        console.log(`File type: ${file.fileType}`);
        console.log(`Base64 length: ${file.base64Data.length}`);
        console.log(`Base64 validation: ${validateBase64(file.base64Data)}`);
        console.log(`Base64 sample (first 100 chars): ${file.base64Data.substring(0, 100)}`);
        
        // ทดสอบ decode
        try {
          const decoded = atob(file.base64Data);
          console.log(`Decode test successful, decoded length: ${decoded.length}`);
        } catch (decodeError) {
          console.error(`Decode test failed for ${file.fileName}:`, decodeError);
        }
        
        console.log('---');
      } catch (error) {
        console.error(`Error testing ${file.fileName}:`, error);
      }
    }
  };

  // ฟังก์ชันแสดงคำแนะนำเมื่อเกิดปัญหา GPU memory
  const showGpuMemoryTroubleshooting = () => {
    const troubleshootingSteps = `
🔧 วิธีแก้ปัญหา GPU Memory เต็ม:

1. 📞 ติดต่อผู้ดูแลระบบให้ restart OCR service ที่ 192.168.128.40:8111
2. ⏰ รอ 5-10 นาที แล้วลองใหม่ (ให้ memory คืนมาเอง)
3. 📷 ใช้รูปภาพขนาดเล็กกว่า 200KB
4. 🔄 ลองทีละไฟล์แทนการส่งหลายไฟล์พร้อมกัน

💡 สาเหตุ: ระบบ OCR ใช้ GPU ในการประมวลผล และ GPU memory เต็ม
`;

    alert(troubleshootingSteps);
    console.log(troubleshootingSteps);
  };

  // ฟังก์ชันสำหรับทดสอบการเชื่อมต่อกับ OCR service
  const testConnectivity = async () => {
    try {
      console.log('Testing connectivity to OCR service...');
      toastInfo('Testing connection to OCR service...');

      const response = await fetch('/api/test-connectivity');
      const result = await response.json();

      console.log('Connectivity test result:', result);

      if (result.success) {
        toastSuccess('✅ OCR service is reachable!');
        console.log('Service details:', result.details);
      } else {
        toastError(`❌ OCR service is not reachable: ${result.details.error}`);
        console.error('Connection failed:', result.details);
      }
    } catch (error) {
      console.error('Connectivity test error:', error);
      toastError(`❌ Connectivity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  const testSimpleApiCall = async () => {
    try {
      // สร้าง base64 ของรูปภาพขนาดเล็ก (1x1 pixel PNG)
      const smallPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
      
      const testData = [{
        fileName: "test-image.png",
        fileType: "image/png", 
        base64Data: smallPngBase64
      }];

      console.log('Testing simple API call with small PNG:', testData);

      const response = await fetch('/api/accounting-ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const result = await response.json();
      console.log('Simple API test result:', result);

      if (!response.ok) {
        console.error('Simple API test failed:', result);
        toastError(`API Test Failed: ${result.error || 'Unknown error'}`);
      } else {
        console.log('Simple API test successful!');
        toastSuccess('API Test Successful!');
      }
    } catch (error) {
      console.error('Simple API test error:', error);
      toastError(`API Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handlers for StartProcess - เชื่อมต่อกับ API จริง
  const handleStartProcess = async () => {
    if (!sourceFiles || sourceFiles.length === 0) {
      toastError("No source file.");
      return;
    }

    try {
      setProcessing(true);
      
      // เรียก API จริงสำหรับ Accounting OCR
      await processAccountingOcr();
      
      toastSuccess("Accounting OCR processing completed.");
      
      // นำทางไปหน้า accounting summary
      router.push('/accounting/summary');
      
    } catch (error) {
      console.error("Error during Accounting OCR processing", error);
      toastError("Failed to process Accounting OCR. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ฟังก์ชันสำหรับเรียก Accounting OCR API ผ่าน proxy
  const processAccountingOcr = async () => {
    try {
      // เตรียมข้อมูลสำหรับส่งไป API
      const requestData = sourceFiles.map(file => ({
        fileName: file.fileName,
        fileType: file.fileType,
        base64Data: file.base64Data,
      }));

      console.log("Sending request to Accounting OCR API via proxy:", requestData);

      // เรียก API ผ่าน Next.js API proxy
      const response = await fetch('/api/accounting-ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
      }

      const apiResponse: AccountingOcrResponse[] = await response.json();
      console.log("Accounting OCR API Response:", apiResponse);

      // แปลงข้อมูลจาก API ให้เป็นรูปแบบที่ระบบใช้งาน
      const processedResults: SourceFileData[] = apiResponse.map((apiFile) => ({
        id: apiFile.id,
        fileName: apiFile.fileName,
        fileType: apiFile.fileType,
        base64Data: apiFile.base64Data,
        blobUrl: convertBase64ToBlobUrl(apiFile.base64Data),
        ocrResult: apiFile.ocrResult.map(page => ({
          page: page.page,
          base64Data: page.base64Data,
          language: page.language,
          extractedText: page.extractedText,
          blobUrl: convertBase64ToBlobUrl(page.base64Data),
          // เพิ่มข้อมูล accounting ใน extractedText
          reportData: page.reportData, // เก็บข้อมูล structured ไว้ใช้ในหน้า summary
        })),
      }));

      // เก็บผลลัพธ์ไว้ใน Redux store เพื่อใช้ในหน้า summary
      dispatch(clearFiles());
      dispatch(addFiles(processedResults));

      return processedResults;
    } catch (error) {
      console.error("[Accounting OCR] Failed during processAccountingOcr:", error);
      
      // จัดการข้อผิดพลาดแบบละเอียด
      if (error instanceof Error) {
        if (error.message.includes('CUDA out of memory')) {
          toastError('❌ GPU Memory เต็ม - ระบบต้องการ restart');
          showGpuMemoryTroubleshooting();
          throw new Error('ระบบ OCR ขาด memory GPU กรุณาติดต่อผู้ดูแลระบบเพื่อ restart service');
        } else if (error.message.includes('Cannot connect to OCR service')) {
          throw new Error('ไม่สามารถเชื่อมต่อกับระบบ OCR ได้ กรุณาตรวจสอบการเชื่อมต่อเครือข่าย');
        } else if (error.message.includes('API Error: 503')) {
          throw new Error('ระบบ OCR ไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่อีกครั้ง');
        } else if (error.message.includes('API Error: 500')) {
          throw new Error('เกิดข้อผิดพลาดในระบบ OCR อาจเป็นปัญหา memory หรือ GPU กรุณาลองใหม่');
        }
      }
      
      throw error;
    }
  };
  
  return (
    <div className="flex flex-col p-2 h-full">
      {/* Source Add Button && Input Language Selection */}
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
        {/* Input Language Selection & Start Process */}
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-4 w-full">
            {/* Debug buttons - สำหรับ development */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <button
                  onClick={testConnectivity}
                  className="text-white bg-green-500 hover:bg-green-600 font-semibold px-3 py-1 rounded-md text-xs w-full md:w-auto"
                >
                  Test Connection
                </button>
                <button
                  onClick={testBase64Encoding}
                  className="text-white bg-yellow-500 hover:bg-yellow-600 font-semibold px-3 py-1 rounded-md text-xs w-full md:w-auto"
                  disabled={sourceFiles.length === 0}
                >
                  Test Base64
                </button>
                <button
                  onClick={testSimpleApiCall}
                  className="text-white bg-purple-500 hover:bg-purple-600 font-semibold px-3 py-1 rounded-md text-xs w-full md:w-auto"
                >
                  Test API
                </button>
                <button
                  onClick={showGpuMemoryTroubleshooting}
                  className="text-white bg-red-500 hover:bg-red-600 font-semibold px-3 py-1 rounded-md text-xs w-full md:w-auto"
                >
                  GPU Help
                </button>
              </>
            )}
            
            <button
              onClick={handleStartProcess}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-full md:w-auto md:ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={processing || sourceFiles.length === 0}
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