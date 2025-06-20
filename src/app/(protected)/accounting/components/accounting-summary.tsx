'use client'

import { useState, useEffect, useCallback, useMemo } from "react";
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



// ✅ Utility Functions (ย้ายไปไฟล์ utils ได้)
const cleanNumericValue = (value: string | number): string => {
  if (typeof value === 'number') return value.toString();
  const cleaned = String(value || '0').replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? '0' : parsed.toString();
};

// ✅ การเรียงลำดับที่ใช้งานได้จริง
const sortAccountingData = (data: Accounting[]): Accounting[] => {
  return [...data].sort((a, b) => {
    const extractParts = (filename: string) => {
      const match = filename.match(/^(.+?)\s*\(Page\s*(\d+)\)$/i);
      return match ? {
        baseName: match[1].trim(),
        pageNum: parseInt(match[2], 10)
      } : { baseName: filename, pageNum: 1 };
    };

    const partsA = extractParts(a.filename);
    const partsB = extractParts(b.filename);
    
    const nameComp = partsA.baseName.localeCompare(partsB.baseName);
    return nameComp !== 0 ? nameComp : partsA.pageNum - partsB.pageNum;
  });
};

// ✅ แปลงข้อมูล OCR เป็น Accounting (ลดความซับซ้อน)
const convertOcrToAccounting = (sourceFiles: SourceFileData[]): Accounting[] => {
  const result: Accounting[] = [];
  
  sourceFiles.forEach((file) => {
    file.ocrResult?.forEach((page) => {
      const reportData = (page as any).reportData;
      
      // สร้าง record จากข้อมูลที่มี หรือค่าเริ่มต้น
      const record: Accounting = {
        id: `${file.id}-page-${page.page}-${Date.now()}`,
        invoiceDate: reportData?.invoiceDate || '',
        invoiceNo: reportData?.invoiceNo || '',
        sellerName: reportData?.sellerName || '',
        sellerTaxId: reportData?.sellerTaxId || '',
        branch: reportData?.branch || '',
        productValue: parseFloat(cleanNumericValue(reportData?.productValue || '0')),
        vat: parseFloat(cleanNumericValue(reportData?.vat || '0')),
        totalAmount: parseFloat(cleanNumericValue(reportData?.totalAmount || '0')),
        filename: `${file.fileName} (Page ${page.page})`,
        imageUrl: page.blobUrl || '',
        createdDate: new Date(),
        createdBy: 'system',
        isTemporary: true,
      };
      
      result.push(record);
    });
  });
  
  return result;
};

// ✅ Main Component (ลดความซับซ้อนลงอย่างมาก)
export default function AccountingSummary() {
  const router = useRouter();
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const sourceFiles = useSelector(selectAllAccountingFiles);
  const { toastSuccess, toastError } = useToast();

  // ✅ State ที่จำเป็นจริงๆ
  const [data, setData] = useState<Accounting[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingData, setEditingData] = useState<Accounting | null>(null);
  const [modals, setModals] = useState({
    form: false,
    export: false,
    save: false
  });
  const [loading, setLoading] = useState(false);

  const userId = session?.user?.userId ?? "admin";

  // ✅ ประมวลผลข้อมูลจาก API
  const processedData = useMemo(() => {
    if (sourceFiles.length === 0) return [];
    
    const converted = convertOcrToAccounting(sourceFiles);
    return sortAccountingData(converted);
  }, [sourceFiles]);

  // ✅ ข้อมูลสำหรับแสดงผล
  const displayData = useMemo(() => 
    data.map((item, index) => ({ ...item, no: index + 1 })),
    [data]
  );

  // ✅ Update data เมื่อ processedData เปลี่ยน
  useEffect(() => {
    setData(processedData);
  }, [processedData]);

  // ✅ Event Handlers (แบบกระชับ)
  const handleBack = () => router.push('/accounting');
  
  const toggleModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: !prev[modalName] }));
  };

  const handleDetail = (row?: Accounting) => {
    setEditingData(row || null);
    toggleModal('form');
  };

  const handleFormSave = (updatedData: Accounting) => {
    setData(prev => sortAccountingData(
      prev.map(item => item.id === updatedData.id ? { ...item, ...updatedData } : item)
    ));
    toastSuccess('Data updated successfully!');
  };

  // ✅ Save Function (ลดความซับซ้อน)
  const handleSaveFiles = async (selectedFiles: SourceFileData[]) => {
    try {
      setLoading(true);
      let successCount = 0;

      for (const file of selectedFiles) {
        for (const page of file.ocrResult || []) {
          try {
            const reportData = (page as any).reportData || {};
            
            await saveAccountingOcr({
              userId,
              fileName: file.fileName,
              pageNumber: page.page,
              fileType: file.fileType || "",
              pages: [{ page: page.page, base64Data: page.base64Data || "" }],
              reportData: {
                invoiceDate: reportData.invoiceDate || "",
                invoiceNo: reportData.invoiceNo || "",
                sellerName: reportData.sellerName || "",
                sellerTaxId: reportData.sellerTaxId || "",
                branch: reportData.branch || "",
                productValue: cleanNumericValue(reportData.productValue || "0"),
                vat: cleanNumericValue(reportData.vat || "0"),
                totalAmount: cleanNumericValue(reportData.totalAmount || "0")
              }
            });
            
            successCount++;
          } catch (error) {
            console.error(`Failed to save: ${file.fileName} Page ${page.page}`, error);
          }
        }
      }

      if (successCount > 0) {
        toastSuccess(`Successfully saved ${successCount} records!`);
      }
    } catch (error) {
      toastError("Save process failed.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Render (กระชับและชัดเจน)
  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64">Processing...</div>;
    }

    if (data.length === 0) {
      return (
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded border">
          <div className="text-center">
            <div className="text-lg text-gray-600 mb-2">No data available</div>
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
          data: displayData,
        })}
        data={displayData}
        selectedIds={selectedIds}
        defaultSorting={[]}
      />
    );
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-4">
        <button
          onClick={handleBack}
          className="bg-[#818893] hover:bg-gray-600 text-white px-6 py-2 rounded text-sm font-medium"
        >
          Back
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => toggleModal('save')}
            disabled={data.length === 0}
            className="bg-[#0369A1] hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded text-sm font-medium"
          >
            Save {data.length > 0 && `(${data.length})`}
          </button>
          
          <button
            onClick={() => toggleModal('export')}
            disabled={data.length === 0}
            className="bg-[#0369A1] hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded text-sm font-medium"
          >
            Export {data.length > 0 && `(${data.length})`}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 mx-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          Summary Report 
          {data.length > 0 && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              Total: {data.length} records
            </span>
          )}
        </h3>
        
        {renderContent()}
      </div>

      {/* Modals */}
      <AccountingSaveModal
        isOpen={modals.save}
        onClose={() => toggleModal('save')}
        sourceFiles={sourceFiles}
        onSave={handleSaveFiles}
      />

      <AccountingExportModal
        isOpen={modals.export}
        onClose={() => toggleModal('export')}
        accountingData={data}
      />

      {modals.form && (
        <AccountingForm
          showModal={modals.form}
          setShowModal={(value) => setModals(prev => ({ ...prev, form: typeof value === 'function' ? value(prev.form) : value }))}
          editingData={editingData}
          onSave={handleFormSave}
        />
      )}
    </>
  );
}