'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSelector } from 'react-redux';
import { selectAllAccountingFiles } from '@/app/store/file/fileSelectors';
import { SourceFileData } from "@/app/lib/interfaces";
import { saveAccountingOcr } from "@/app/lib/api/accounting-ocr";
import AccountingColumns from "./accounting-column";
import DataTable from "@/app/components/table/DataTable";
import AccountingForm from "./accounting-form";
import { Accounting } from "@/app/type/accounting";
import { update } from "@/app/lib/services/accounting";
import useToast from "@/app/hooks/useToast";
import AccountingExportModal from "./accountingExportModal";
import AccountingSaveModal from "./accountingSaveModal";

// 🔧 Utility Functions (ย้ายออกมาไว้นอก component เพื่อป้องกัน re-creation)
const convertDateFormat = (dateString: string): string => {
  if (!dateString) return '';
  
  const ddmmyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateString.match(ddmmyyyyPattern);
  
  if (match) {
    const [, day, month, year] = match;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    
    if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateString)) {
    return dateString;
  }
  
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
    // Ignore parsing errors
  }
  
  return '';
};

const cleanNumericValue = (value: string | number): string => {
  if (typeof value === 'number') return value.toString();
  if (!value) return '0';
  
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? '0' : parsed.toString();
};

// ✅ ปรับปรุงฟังก์ชัน parseExtractedTextToAccounting ให้ดีขึ้น
const parseExtractedTextToAccounting = (extractedText: string, file: SourceFileData, pageIndex: number, pageNumber: number): Accounting | null => {
  try {
    // ลองแยกข้อมูลในรูปแบบต่างๆ
    const patterns = {
      // สำหรับข้อมูลที่มี label ชัดเจน
      invoiceDate: /(?:Invoice Date|วันที่|Date)[:\s]*([^\n\r]+)/i,
      invoiceNo: /(?:Invoice No|เลขที่|No\.?|เลขที่เอกสาร)[:\s]*([^\n\r\s]+)/i,
      sellerName: /(?:Seller Name|ชื่อผู้ขาย|Company|บริษัท)[:\s]*([^\n\r]+)/i,
      sellerTaxId: /(?:Seller Tax ID|เลขประจำตัวผู้เสียภาษี|Tax ID)[:\s]*([0-9-]+)/i,
      branch: /(?:Branch|สาขา)[:\s]*([^\n\r]+)/i,
      productValue: /(?:Product Value|มูลค่าสินค้า|Subtotal)[:\s]*([0-9,.]+)/i,
      vat: /(?:VAT|ภาษีมูลค่าเพิ่ม|Tax)[:\s]*([0-9,.]+)/i,
      totalAmount: /(?:Total Amount|รวมทั้งสิ้น|Total)[:\s]*([0-9,.]+)/i,
    };

    const extracted = Object.entries(patterns).reduce((acc, [key, pattern]) => {
      const match = extractedText.match(pattern);
      acc[key] = match?.[1]?.trim() || '';
      return acc;
    }, {} as Record<string, string>);

    // ถ้าไม่เจอข้อมูลสำคัญ ให้ลองวิธีอื่น
    if (!extracted.sellerName && !extracted.invoiceNo) {
      return null;
    }

    return {
      id: `${file.id}-page-${pageIndex}-${Date.now()}-${Math.random()}`,
      invoiceDate: extracted.invoiceDate,
      invoiceNo: extracted.invoiceNo,
      sellerName: extracted.sellerName,
      sellerTaxId: extracted.sellerTaxId,
      branch: extracted.branch,
      productValue: parseFloat(cleanNumericValue(extracted.productValue)),
      vat: parseFloat(cleanNumericValue(extracted.vat)),
      totalAmount: parseFloat(cleanNumericValue(extracted.totalAmount)),
      filename: `${file.fileName} (Page ${pageNumber})`,
      imageUrl: '',
      createdDate: new Date(),
      createdBy: 'system',
    };
  } catch (error) {
    console.error('Error parsing extracted text:', error);
    return null;
  }
};

// ✅ ปรับปรุงฟังก์ชัน extractBasicInfoFromText
const extractBasicInfoFromText = (extractedText: string, file: SourceFileData, pageIndex: number, pageNumber: number): Accounting => {
  const text = extractedText || '';
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let sellerName = '';
  let invoiceInfo = '';
  let invoiceDate = '';
  
  // หาชื่อบริษัท/ผู้ขาย
  for (const line of lines.slice(0, 15)) {
    if (line.length > 10 && !line.match(/^\d+/) && !line.match(/^(page|หน้า)/i)) {
      if (!sellerName && (
        line.includes('บริษัท') || 
        line.includes('Company') || 
        line.includes('Co.,') || 
        line.includes('Ltd') ||
        line.includes('จำกัด') ||
        line.includes('Corporation')
      )) {
        sellerName = line.slice(0, 100); // จำกัดความยาว
        break;
      }
    }
  }
  
  // หาเลขที่เอกสาร
  const docPatterns = [
    /(?:เลขที่|No\.?|Invoice|INV|เลขที่เอกสาร)[:\s]*([A-Z0-9-]+)/i,
    /([A-Z]{2,}\d{4,})/g, // รูปแบบทั่วไป เช่น INV2024001
  ];
  
  for (const pattern of docPatterns) {
    const match = text.match(pattern);
    if (match) {
      invoiceInfo = match[1] || match[0];
      break;
    }
  }
  
  // หาวันที่
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(\d{4}-\d{1,2}-\d{1,2})/,
    /(\d{1,2}-\d{1,2}-\d{4})/,
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      invoiceDate = match[1];
      break;
    }
  }
  
  // ถ้าไม่เจอชื่อบริษัท ให้ใช้ข้อความต้นๆ
  if (!sellerName) {
    const firstMeaningfulLine = lines.find(line => 
      line.length > 5 && 
      !line.match(/^\d+$/) && 
      !line.match(/^(page|หน้า)/i)
    );
    sellerName = firstMeaningfulLine ? `${firstMeaningfulLine.slice(0, 50)}...` : 'Unknown';
  }
  
  return {
    id: `${file.id}-page-${pageIndex}-basic-${Date.now()}-${Math.random()}`,
    invoiceDate: invoiceDate,
    invoiceNo: invoiceInfo || `DOC-${pageNumber}`,
    sellerName: sellerName,
    sellerTaxId: '',
    branch: '',
    productValue: 0,
    vat: 0,
    totalAmount: 0,
    filename: `${file.fileName} (Page ${pageNumber})`,
    imageUrl: '',
    createdDate: new Date(),
    createdBy: 'system',
  };
};

const validatePayload = (payload: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!payload.userId) errors.push('Missing userId');
  if (!payload.fileName) errors.push('Missing fileName');
  if (!payload.fileType) errors.push('Missing fileType');
  if (!payload.pages?.length) errors.push('Missing pages data');
  if (!payload.reportData?.invoiceDate) errors.push('Missing invoiceDate');
  if (!payload.reportData?.invoiceNo && !payload.reportData?.sellerName) {
    errors.push('Missing both invoiceNo and sellerName');
  }
  
  return { isValid: errors.length === 0, errors };
};

// 📊 Summary Information Component
const SummaryReport = ({ data, sourceFiles }: { data: Accounting[], sourceFiles: SourceFileData[] }) => {
  const stats = useMemo(() => {
    const totalFiles = sourceFiles.length;
    const totalPages = sourceFiles.reduce((sum, file) => sum + (file.ocrResult?.length || 0), 0);
    const totalRecords = data.length;
    const totalAmount = data.reduce((sum, record) => sum + (record.totalAmount || 0), 0);
    
    return { totalFiles, totalPages, totalRecords, totalAmount };
  }, [data, sourceFiles]);
  
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Summary Report</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.totalFiles}</div>
          <div className="text-gray-600">Files</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.totalPages}</div>
          <div className="text-gray-600">Pages</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{stats.totalRecords}</div>
          <div className="text-gray-600">Invoice Records</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-orange-600">
            {stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-gray-600">Total Amount</div>
        </div>
      </div>
      
      {/* File breakdown */}
      <div className="mt-4 p-3 bg-white rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">📁 File Breakdown:</h4>
        <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
          {sourceFiles.map((file, index) => (
            <div key={file.id} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
              <span className="text-gray-700 truncate flex-1 mr-2">
                {index + 1}. {file.fileName}
              </span>
              <span className="text-blue-600 font-medium">
                {file.ocrResult?.length || 0} page{(file.ocrResult?.length || 0) !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 🎯 Main Component
export default function AccountingSummary() {
  const router = useRouter();
  const { data: session } = useSession();
  const sourceFiles = useSelector(selectAllAccountingFiles);
  const { toastSuccess, toastError } = useToast();

  // ✅ ใช้ useRef เพื่อ track การประมวลผลครั้งล่าสุด
  const lastProcessedRef = useRef<string>('');
  const isProcessingRef = useRef(false);

  // State management
  const [data, setData] = useState<Accounting[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingData, setEditingData] = useState<Accounting | null>(null);
  const [modals, setModals] = useState({
    form: false,
    export: false,
    save: false
  });
  const [loading, setLoading] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });

  const userId = session?.user?.userId ?? "admin";

  // ✅ สร้าง hash key สำหรับ sourceFiles เพื่อ detect การเปลี่ยนแปลง
  const sourceFilesHash = useMemo(() => {
    if (!sourceFiles.length) return '';
    return sourceFiles.map(f => `${f.id}-${f.fileName}-${f.ocrResult?.length || 0}`).join('|');
  }, [sourceFiles]);

  // 🚀 Optimized data conversion - ทำงานเฉพาะเมื่อข้อมูลเปลี่ยนแปลงจริงๆ
  const convertedAccountingData = useMemo(() => {
    // ✅ ป้องกันการประมวลผลซ้ำ
    if (!sourceFiles.length) return [];
    if (isProcessingRef.current) return data; // ถ้ากำลังประมวลผลอยู่ ให้ return ข้อมูลเดิม
    if (lastProcessedRef.current === sourceFilesHash) return data; // ถ้าข้อมูลไม่เปลี่ยน ให้ return ข้อมูลเดิม

    console.log('🔍 Converting OCR data to accounting records...');
    console.log('📁 Source files:', sourceFiles.length);
    
    isProcessingRef.current = true; // ป้องกันการประมวลผลซ้ำ
    const accountingData: Accounting[] = [];
    
    sourceFiles.forEach((file, fileIndex) => {
      console.log(`\n📄 Processing file ${fileIndex + 1}: ${file.fileName}`);
      console.log(`📑 Pages in file: ${file.ocrResult?.length || 0}`);
      
      file.ocrResult?.forEach((page, pageIndex) => {
        const reportData = (page as any).reportData;
        
        if (reportData) {
          // ✅ มี reportData จาก API - ใช้ข้อมูลนี้
          const accountingRecord: Accounting = {
            id: `${file.id}-page-${pageIndex}-${Date.now()}-${Math.random()}`,
            invoiceDate: reportData.invoiceDate || '',
            invoiceNo: reportData.invoiceNo || '',
            sellerName: reportData.sellerName || '',
            sellerTaxId: reportData.sellerTaxId || '',
            branch: reportData.branch || '',
            productValue: parseFloat(cleanNumericValue(reportData.productValue)),
            vat: parseFloat(cleanNumericValue(reportData.vat)),
            totalAmount: parseFloat(cleanNumericValue(reportData.totalAmount)),
            filename: `${file.fileName} (Page ${page.page})`,
            imageUrl: page.blobUrl || '',
            createdDate: new Date(),
            createdBy: 'system',
          };
          
          accountingData.push(accountingRecord);
          
        } else if (page.extractedText) {
          // ⚠️ ไม่มี reportData แต่มี extractedText - ลองแยกข้อมูล
          const parsedRecord = parseExtractedTextToAccounting(
            page.extractedText, 
            file, 
            pageIndex,
            page.page
          );
          
          if (parsedRecord && (parsedRecord.invoiceNo || parsedRecord.sellerName)) {
            // ✅ แยกข้อมูลได้และมีข้อมูลสำคัญ
            accountingData.push(parsedRecord);
          } else {
            // 🔍 ลองดึงข้อมูลพื้นฐานจาก extractedText
            const basicRecord = extractBasicInfoFromText(page.extractedText, file, pageIndex, page.page);
            accountingData.push(basicRecord);
          }
        } else {
          // ❌ ไม่มีข้อมูลอะไรเลย - แสดง row ว่าง
          const emptyRecord: Accounting = {
            id: `${file.id}-page-${pageIndex}-no-data-${Date.now()}-${Math.random()}`,
            invoiceDate: '',
            invoiceNo: '',
            sellerName: `No data extracted`,
            sellerTaxId: '',
            branch: '',
            productValue: 0,
            vat: 0,
            totalAmount: 0,
            filename: `${file.fileName} (Page ${page.page})`,
            imageUrl: page.blobUrl || '',
            createdDate: new Date(),
            createdBy: 'system',
          };
          
          accountingData.push(emptyRecord);
        }
      });
    });
    
    console.log(`\n📊 Total accounting records created: ${accountingData.length}`);
    
    // ✅ เก็บ hash และปลดล็อค
    lastProcessedRef.current = sourceFilesHash;
    isProcessingRef.current = false;
    
    return accountingData;
  }, [sourceFiles, sourceFilesHash, data]); // เพิ่ม data เป็น dependency

  // 🔄 Update data เฉพาะเมื่อผลลัพธ์เปลี่ยนแปลงจริงๆ
  useEffect(() => {
    if (convertedAccountingData.length > 0 && convertedAccountingData !== data) {
      setLoading(true);
      setData(convertedAccountingData);
      setLoading(false);
    }
  }, [convertedAccountingData, data]);

  // 📊 Memoized data with row numbers
  const dataWithRowNumbers = useMemo(() => 
    data.map((item, index) => ({ ...item, no: index + 1 })),
    [data]
  );

  // 🎯 Event handlers with useCallback for performance
  const handleBack = useCallback(() => {
    router.push('/accounting');
  }, [router]);

  const handleModalToggle = useCallback((modalName: keyof typeof modals, state?: boolean) => {
    setModals(prev => ({
      ...prev,
      [modalName]: state !== undefined ? state : !prev[modalName]
    }));
  }, []);

  const setFormModalState = useCallback((value: React.SetStateAction<boolean>) => {
    if (typeof value === 'function') {
      setModals(prev => ({
        ...prev,
        form: value(prev.form)
      }));
    } else {
      setModals(prev => ({
        ...prev,
        form: value
      }));
    }
  }, []);

  const handleSave = useCallback(() => {
    if (sourceFiles.length === 0) {
      toastError("No data to save.");
      return;
    }
    handleModalToggle('save', true);
  }, [sourceFiles.length, toastError, handleModalToggle]);

  const handleExport = useCallback(() => {
    if (data.length === 0) {
      toastError("No data to export.");
      return;
    }
    handleModalToggle('export', true);
  }, [data.length, toastError, handleModalToggle]);

  // 🚀 Optimized save function with progress tracking
  const handleSaveFiles = useCallback(async (selectedFiles: SourceFileData[]) => {
    try {
      setSaveProgress({ current: 0, total: selectedFiles.length });
      
      let successCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setSaveProgress({ current: i + 1, total: selectedFiles.length });

        try {
          const reportData = file.ocrResult?.find(page => (page as any).reportData)?.reportData;
          
          if (!reportData) {
            errors.push(`No invoice data found for: ${file.fileName}`);
            continue;
          }

          const apiPayload = {
            userId,
            fileName: file.fileName || "",
            fileType: file.fileType || "",
            pages: file.ocrResult?.map(page => ({
              page: page.page,
              base64Data: page.base64Data || ""
            })) ?? [],
            reportData: {
              invoiceDate: convertDateFormat(reportData.invoiceDate || ""),
              invoiceNo: String(reportData.invoiceNo || ""),
              sellerName: String(reportData.sellerName || ""),
              sellerTaxId: String(reportData.sellerTaxId || ""),
              branch: String(reportData.branch || ""),
              productValue: cleanNumericValue(reportData.productValue || "0"),
              vat: cleanNumericValue(reportData.vat || "0"),
              totalAmount: cleanNumericValue(reportData.totalAmount || "0")
            }
          };

          const validation = validatePayload(apiPayload);
          if (!validation.isValid) {
            errors.push(`Invalid data for ${file.fileName}: ${validation.errors.join(', ')}`);
            continue;
          }

          await saveAccountingOcr(apiPayload);
          successCount++;
          
        } catch (fileError) {
          console.error(`Failed to save file: ${file.fileName}`, fileError);
          errors.push(`Failed to save: ${file.fileName}`);
        }
      }

      // Show results
      if (successCount > 0) {
        toastSuccess(`✅ Successfully saved ${successCount} out of ${selectedFiles.length} file(s)!`);
      }
      
      if (errors.length > 0) {
        console.warn('Save errors:', errors);
        toastError(`Some files failed to save. Check console for details.`);
      }
      
    } catch (error) {
      console.error('Save process failed:', error);
      toastError("Save process failed. Please try again.");
    } finally {
      setSaveProgress({ current: 0, total: 0 });
    }
  }, [userId, toastSuccess, toastError]);

  const handleDetail = useCallback(async (row?: Accounting) => {
    try {
      setEditingData(row || null);
      handleModalToggle('form', true);
    } catch (error) {
      console.error('Failed to load detail:', error);
      toastError('Failed to load details');
    }
  }, [handleModalToggle, toastError]);

  const handleFormSave = useCallback(async (updatedData: Accounting) => {
    try {
      setLoading(true);
      
      const result = await update(updatedData.id, {
        id: updatedData.id,
        invoiceDate: updatedData.invoiceDate,
        invoiceNo: updatedData.invoiceNo,
        sellerName: updatedData.sellerName,
        sellerTaxId: updatedData.sellerTaxId,
        branch: updatedData.branch,
        productValue: updatedData.productValue,
        vat: updatedData.vat,
        totalAmount: updatedData.totalAmount,
        updatedBy: 'current_user'
      });
      
      setData(prev => prev.map(item => item.id === result.id ? result : item));
      toastSuccess('Data updated successfully!');
      
    } catch (error) {
      console.error('Save failed:', error);
      toastError('Save failed!');
    } finally {
      setLoading(false);
    }
  }, [toastSuccess, toastError]);

  // 🎨 Render content based on state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Processing accounting data...</div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded border">
          <div className="text-center">
            <div className="text-lg text-gray-600 mb-2">No accounting data available</div>
            <div className="text-sm text-gray-500">
              Please go back and process some invoice files first
            </div>
          </div>
        </div>
      );
    }

    return (
      <DataTable
        columns={AccountingColumns({
          showCheckbox: false,
          canEdit: true,
          openDetailModal: handleDetail,
          selectedIds,
          setSelectedIds,
          data: dataWithRowNumbers,
        })}
        data={dataWithRowNumbers}
        selectedIds={selectedIds}
        defaultSorting={[{ id: "invoiceDate", desc: true }]}
      />
    );
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-4">
        <button
          onClick={handleBack}
          className="bg-[#818893] hover:bg-gray-600 text-white px-6 py-2 rounded text-sm font-medium transition-colors"
        >
          Back
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={sourceFiles.length === 0}
            className="bg-[#0369A1] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded text-sm font-medium transition-colors"
          >
            Save {sourceFiles.length > 0 && `(${sourceFiles.length})`}
          </button>
          <button
            onClick={handleExport}
            disabled={data.length === 0}
            className="bg-[#0369A1] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded text-sm font-medium transition-colors"
          >
            Export {data.length > 0 && `(${data.length})`}
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      {saveProgress.total > 0 && (
        <div className="mb-4 px-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(saveProgress.current / saveProgress.total) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Saving {saveProgress.current} of {saveProgress.total} files...
          </p>
        </div>
      )}

      {/* Main content */}
      <div className="p-4 mx-auto">
        {/* Summary Report */}
        {sourceFiles.length > 0 && (
          <SummaryReport data={data} sourceFiles={sourceFiles} />
        )}
        
        {/* Data Table */}
        {renderContent()}
      </div>

      {/* Modals */}
      <AccountingSaveModal
        isOpen={modals.save}
        onClose={() => handleModalToggle('save', false)}
        sourceFiles={sourceFiles}
        onSave={handleSaveFiles}
      />

      <AccountingExportModal
        isOpen={modals.export}
        onClose={() => handleModalToggle('export', false)}
        accountingData={data}
      />

      {modals.form && (
        <AccountingForm
          showModal={modals.form}
          setShowModal={setFormModalState}
          editingData={editingData}
          onSave={handleFormSave}
        />
      )}
    </>
  );
}