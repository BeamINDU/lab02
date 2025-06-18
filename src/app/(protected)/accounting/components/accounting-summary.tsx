'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSelector, useDispatch } from 'react-redux';
import { selectAllAccountingFiles } from '@/app/store/file/fileSelectors';
import { updateAccountingFiles } from '@/app/store/file/accountingFileActions';
import { SourceFileData } from "@/app/lib/interfaces";
import { saveAccountingOcr } from "@/app/lib/api/accounting-ocr";
import AccountingColumns from "./accounting-column";
import DataTable from "@/app/components/table/DataTable";
import AccountingForm from "./accounting-form";
import { Accounting } from "@/app/type/accounting";
import useToast from "@/app/hooks/useToast";
import AccountingExportModal from "./accountingExportModal";
import AccountingSaveModal from "./accountingSaveModal";


const sortAccountingData = (data: Accounting[]): Accounting[] => {
  return [...data].sort((a, b) => {
    const extractFileAndPage = (filename: string) => {
      const match = filename.match(/^(.+?)\s*\(Page\s*(\d+)\)$/i);
      if (match) {
        return {
          fileName: match[1].trim(),
          pageNumber: parseInt(match[2], 10)
        };
      }
      return {
        fileName: filename,
        pageNumber: 1
      };
    };

    const fileA = extractFileAndPage(a.filename);
    const fileB = extractFileAndPage(b.filename);

    // เรียงตาม filename ก่อน
    const fileNameComparison = fileA.fileName.localeCompare(fileB.fileName);
    if (fileNameComparison !== 0) {
      return fileNameComparison;
    }

    return fileA.pageNumber - fileB.pageNumber;
  });
};


const syncEditedDataToRedux = (
  editedData: Accounting[], 
  sourceFiles: SourceFileData[]
): SourceFileData[] => {
  return sourceFiles.map(file => ({
    ...file,
    ocrResult: file.ocrResult?.map(page => {
      const editedRecord = editedData.find(record => 
        record.filename === `${file.fileName} (Page ${page.page})`
      );

      if (editedRecord) {
        return {
          ...page,
          reportData: {
            invoiceDate: editedRecord.invoiceDate,
            invoiceNo: editedRecord.invoiceNo,
            sellerName: editedRecord.sellerName,
            sellerTaxId: editedRecord.sellerTaxId,
            branch: editedRecord.branch,
            productValue: editedRecord.productValue.toString(),
            vat: editedRecord.vat.toString(),
            totalAmount: editedRecord.totalAmount.toString(),
          }
        };
      }

      return page;
    }) || []
  }));
};

//  Utility Functions
const convertDateFormat = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') {

    return new Date().toISOString().split('T')[0]; 
  }
  
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
  

  return new Date().toISOString().split('T')[0];
};

const cleanNumericValue = (value: string | number): string => {
  if (typeof value === 'number') return value.toString();
  if (!value) return '0';
  
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? '0' : parsed.toString();
};

const parseExtractedTextToAccounting = (extractedText: string, file: SourceFileData, pageNumber: number): Accounting | null => {
  try {
    const patterns = {
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

    return {
      id: `${file.id}-page-${pageNumber}-${Date.now()}-${Math.random()}`,
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
      isTemporary: true, 
    };
  } catch (error) {
    console.error('Error parsing extracted text:', error);
    return null;
  }
};

const extractBasicInfoFromText = (extractedText: string, file: SourceFileData, pageNumber: number): Accounting => {
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
        sellerName = line.slice(0, 100);
        break;
      }
    }
  }
  
  // หาเลขที่เอกสาร
  const docPatterns = [
    /(?:เลขที่|No\.?|Invoice|INV|เลขที่เอกสาร)[:\s]*([A-Z0-9-]+)/i,
    /([A-Z]{2,}\d{4,})/g,
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
  

  if (!sellerName) {
    const firstMeaningfulLine = lines.find(line => 
      line.length > 5 && 
      !line.match(/^\d+$/) && 
      !line.match(/^(page|หน้า)/i)
    );
    sellerName = firstMeaningfulLine ? `${firstMeaningfulLine.slice(0, 50)}...` : 'Unknown';
  }
  
  return {
    id: `${file.id}-page-${pageNumber}-basic-${Date.now()}-${Math.random()}`,
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
    isTemporary: true, 
  };
};

const validatePayload = (payload: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!payload.userId) errors.push('Missing userId');
  if (!payload.fileName) errors.push('Missing fileName');
  if (!payload.fileType) errors.push('Missing fileType');
  if (!payload.pages?.length) errors.push('Missing pages data');
  if (!payload.pageNumber) errors.push('Missing pageNumber');
  
  const reportData = payload.reportData;
  if (!reportData) {
    errors.push('Missing reportData');
  } else {
    if (!reportData.invoiceNo && !reportData.sellerName) {
      errors.push('Missing both invoiceNo and sellerName');
    }
    
    if (!reportData.invoiceDate) {
      console.warn('Missing invoiceDate - will use empty string');
    }
    
    if (!reportData.totalAmount || parseFloat(reportData.totalAmount) <= 0) {
      console.warn('Invalid or missing totalAmount');
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

//  Main Component
export default function AccountingSummary() {
  const router = useRouter();
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const sourceFiles = useSelector(selectAllAccountingFiles);
  const { toastSuccess, toastError } = useToast();

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

  const convertedAccountingData = useMemo(() => {
    if (!sourceFiles.length) return [];
    
    console.log('Converting OCR data to accounting records (1 page = 1 row)...');
    console.log('Source files:', sourceFiles.length);
    
    const accountingData: Accounting[] = [];
    
    sourceFiles.forEach((file, fileIndex) => {
      console.log(`\n Processing file ${fileIndex + 1}: ${file.fileName}`);
      console.log(`Pages in file: ${file.ocrResult?.length || 0}`);
      
      file.ocrResult?.forEach((page, pageIndex) => {
        const reportData = (page as any).reportData;
        
        if (reportData) {
          const accountingRecord: Accounting = {
            id: `${file.id}-page-${page.page}-${Date.now()}-${Math.random()}`,
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
            isTemporary: true, 
          };
          
          accountingData.push(accountingRecord);
          console.log(`Page ${page.page}: Found reportData - ${reportData.sellerName}`);
          
        } else if (page.extractedText) {
          const parsedRecord = parseExtractedTextToAccounting(page.extractedText, file, page.page);
          
          if (parsedRecord) {
            accountingData.push(parsedRecord);
            console.log(`Page ${page.page}: Parsed data - ${parsedRecord.sellerName}`);
          } else {
            const basicRecord = extractBasicInfoFromText(page.extractedText, file, page.page);
            accountingData.push(basicRecord);
            console.log(`Page ${page.page}: Basic data only - ${basicRecord.sellerName}`);
          }
        } else {

          const emptyRecord: Accounting = {
            id: `${file.id}-page-${page.page}-no-data-${Date.now()}-${Math.random()}`,
            invoiceDate: new Date().toISOString().split('T')[0], 
            invoiceNo: `${file.fileName}-P${page.page}`, 
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
            isTemporary: true, 
          };
          
          accountingData.push(emptyRecord);
          console.log(`Page ${page.page}: No data found - created empty record`);
        }
      });
    });
    
    console.log(`\n Total accounting records created: ${accountingData.length}`);
    console.log(` Expected records (total pages): ${sourceFiles.reduce((sum, file) => sum + (file.ocrResult?.length || 0), 0)}`);
    

    return sortAccountingData(accountingData);
  }, [sourceFiles]);

  useEffect(() => {
    if (convertedAccountingData.length > 0) {
      setLoading(true);
      setData(convertedAccountingData);
      setLoading(false);
    } else if (sourceFiles.length === 0) {
      setData([]);
    }
  }, [convertedAccountingData, sourceFiles.length]);


  const dataWithRowNumbers = useMemo(() => 
    data.map((item, index) => ({ ...item, no: index + 1 })),
    [data]
  );

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
    handleModalToggle('save', true);
  }, [sourceFiles.length, toastError, handleModalToggle]);

  const handleExport = useCallback(() => {
    if (data.length === 0) {
      toastError("No data to export.");
      return;
    }
    handleModalToggle('export', true);
  }, [data.length, toastError, handleModalToggle]);

  const handleSaveFiles = useCallback(async (selectedFiles: SourceFileData[]) => {
    try {
      setSaveProgress({ current: 0, total: selectedFiles.length });
      

      console.log('🔄 Syncing edited data back to Redux...');
      const syncedFiles = syncEditedDataToRedux(data, selectedFiles);
      dispatch(updateAccountingFiles(syncedFiles));
      
      let successCount = 0;
      const errors: string[] = [];


      for (let i = 0; i < syncedFiles.length; i++) {
        const file = syncedFiles[i];
        setSaveProgress({ current: i + 1, total: syncedFiles.length });

        try {
          console.log(`[Save] Processing file: ${file.fileName}`);
          

          const pagesWithData = file.ocrResult || [];

          if (pagesWithData.length === 0) {
            errors.push(`No pages found in file: ${file.fileName}`);
            continue;
          }

          console.log(`[Save] Found ${pagesWithData.length} pages in ${file.fileName}`);


          for (const page of pagesWithData) {
            const reportData = (page as any).reportData;
            
            try {

              const defaultReportData = {
                invoiceDate: new Date().toISOString().split('T')[0],
                invoiceNo: `${file.fileName}-P${page.page}`,
                sellerName: "No data extracted",
                sellerTaxId: "",
                branch: "",
                productValue: "0",
                vat: "0",
                totalAmount: "0"
              };

              const finalReportData = reportData || defaultReportData;

              const apiPayload = {
                userId,
                fileName: `${file.fileName} (Page ${page.page})`,
                fileType: file.fileType || "",
                pageNumber: page.page,
                pages: [{
                  page: page.page,
                  base64Data: page.base64Data || ""
                }],
                reportData: {
                  invoiceDate: convertDateFormat(finalReportData.invoiceDate || ""), 
                  invoiceNo: String(finalReportData.invoiceNo || `${file.fileName}-P${page.page}`),
                  sellerName: String(finalReportData.sellerName || "No data extracted"),
                  sellerTaxId: String(finalReportData.sellerTaxId || ""),
                  branch: String(finalReportData.branch || ""),
                  productValue: cleanNumericValue(finalReportData.productValue || "0"),
                  vat: cleanNumericValue(finalReportData.vat || "0"),
                  totalAmount: cleanNumericValue(finalReportData.totalAmount || "0")
                }
              };


              const validation = validatePayload(apiPayload);
              if (!validation.isValid) {
                console.warn(`Warning for ${file.fileName} Page ${page.page}: ${validation.errors.join(', ')}`);
 
              }

              await saveAccountingOcr(apiPayload);
              successCount++;
              
              console.log(`Saved: ${file.fileName} Page ${page.page} - ${finalReportData.sellerName}`);
              
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (pageError) {
              console.error(`Failed to save page ${page.page} of ${file.fileName}:`, pageError);
              errors.push(`Failed to save: ${file.fileName} Page ${page.page}`);
            }
          }
          
        } catch (fileError) {
          console.error(`Failed to process file: ${file.fileName}`, fileError);
          errors.push(`Failed to process: ${file.fileName}`);
        }
      }


      if (successCount > 0) {
        toastSuccess(`Successfully saved ${successCount} invoice records!`);
      }
      
      if (errors.length > 0) {
        console.warn('Save errors:', errors);
        
        const errorSummary = errors.slice(0, 3).join('\n');
        const hasMore = errors.length > 3;
        
        toastError(`Some records failed to save:\n${errorSummary}${hasMore ? `\n... and ${errors.length - 3} more` : ''}`);
      }
      
    } catch (error) {
      console.error('Save process failed:', error);
      toastError("Save process failed. Please try again.");
    } finally {
      setSaveProgress({ current: 0, total: 0 });
    }
  }, [userId, toastSuccess, toastError, data, dispatch]);

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
      

      setData(prev => {
        const updated = prev.map(item => 
          item.id === updatedData.id ? { ...item, ...updatedData } : item
        );
        return sortAccountingData(updated); 
      });
      
      toastSuccess('Data updated successfully! (Note: Please use "Save" button to save to database)');
      
    } catch (error) {
      console.error('Save failed:', error);
      toastError('Save failed!');
    } finally {
      setLoading(false);
    }
  }, [toastSuccess, toastError]);

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
        defaultSorting={[{ id: "filename", desc: false }]}
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
            disabled={data.length === 0}
            className="bg-[#0369A1] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded text-sm font-medium transition-colors"
          >
            Save {data.length > 0 && `(${data.length})`}
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
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          Summary Report 
          {data.length > 0 && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              (Sorted by File & Page)
            </span>
          )}
        </h3>
        
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