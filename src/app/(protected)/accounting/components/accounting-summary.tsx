'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from 'react-redux';
import { selectAllSourceFiles } from '@/app/store/file/fileSelectors';
import AccountingColumns from "./accounting-column";
import DataTable from "@/app/components/table/DataTable";
import AccountingForm from "./accounting-form";
import { Accounting } from "@/app/type/accounting";
import { update } from "@/app/lib/services/accounting";

export default function AccountingSummary() {
  const router = useRouter();
  const sourceFiles = useSelector(selectAllSourceFiles); 
  const [data, setData] = useState<Accounting[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingData, setEditingData] = useState<Accounting | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // แปลงข้อมูลจาก Redux store เป็นรูปแบบ Accounting
    convertOcrDataToAccounting();
  }, [sourceFiles]);

  const convertOcrDataToAccounting = () => {
    try {
      setLoading(true);
      
      const accountingData: Accounting[] = [];
      
      sourceFiles.forEach((file) => {
        if (file.ocrResult && file.ocrResult.length > 0) {
          file.ocrResult.forEach((page, pageIndex) => {
            // ถ้ามี reportData ใช้ข้อมูลจาก API
            if ((page as any).reportData) {
              const reportData = (page as any).reportData;
              
              const accountingRecord: Accounting = {
                id: `${file.id}-${pageIndex}`,
                invoiceDate: reportData.invoiceDate || '',
                invoiceNo: reportData.invoiceNo || '',
                sellerName: reportData.sellerName || '',
                sellerTaxId: reportData.sellerTaxId || '',
                branch: reportData.branch || '',
                productValue: parseFloat(reportData.productValue) || 0,
                vat: parseFloat(reportData.vat) || 0,
                totalAmount: parseFloat(reportData.totalAmount) || 0,
                filename: file.fileName,
                imageUrl: page.blobUrl || '',
                createdDate: new Date(),
                createdBy: 'system',
              };
              
              accountingData.push(accountingRecord);
            } else {
              // ถ้าไม่มี reportData ให้ parse จาก extractedText (fallback)
              const extractedText = page.extractedText || '';
              const accountingRecord = parseExtractedTextToAccounting(extractedText, file, pageIndex);
              
              if (accountingRecord) {
                accountingData.push(accountingRecord);
              }
            }
          });
        }
      });
      
      setData(accountingData);
      
      if (accountingData.length === 0) {
        console.warn('No accounting data found. You might want to process some files first.');
      }
      
    } catch (error) {
      console.error('Error converting OCR data to accounting:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับแยกข้อมูลจาก extractedText (fallback method)
  const parseExtractedTextToAccounting = (extractedText: string, file: any, pageIndex: number): Accounting | null => {
    try {
      // ใช้ regex หรือ string parsing เพื่อดึงข้อมูล
      const invoiceDateMatch = extractedText.match(/Invoice Date[:\s]*([^\n\r]+)/i);
      const invoiceNoMatch = extractedText.match(/Invoice No[:\s]*([^\n\r]+)/i);
      const sellerNameMatch = extractedText.match(/Seller Name[:\s]*([^\n\r]+)/i);
      const sellerTaxIdMatch = extractedText.match(/Seller Tax ID[:\s]*([^\n\r]+)/i);
      const branchMatch = extractedText.match(/Branch[:\s]*([^\n\r]+)/i);
      const productValueMatch = extractedText.match(/Product Value[:\s]*([0-9,.]+)/i);
      const vatMatch = extractedText.match(/VAT[:\s]*([0-9,.]+)/i);
      const totalAmountMatch = extractedText.match(/Total Amount[:\s]*([0-9,.]+)/i);

      return {
        id: `${file.id}-${pageIndex}`,
        invoiceDate: invoiceDateMatch?.[1]?.trim() || '',
        invoiceNo: invoiceNoMatch?.[1]?.trim() || '',
        sellerName: sellerNameMatch?.[1]?.trim() || '',
        sellerTaxId: sellerTaxIdMatch?.[1]?.trim() || '',
        branch: branchMatch?.[1]?.trim() || '',
        productValue: parseFloat(productValueMatch?.[1]?.replace(/,/g, '') || '0'),
        vat: parseFloat(vatMatch?.[1]?.replace(/,/g, '') || '0'),
        totalAmount: parseFloat(totalAmountMatch?.[1]?.replace(/,/g, '') || '0'),
        filename: file.fileName,
        imageUrl: '',
        createdDate: new Date(),
        createdBy: 'system',
      };
    } catch (error) {
      console.error('Error parsing extracted text:', error);
      return null;
    }
  };

  const handleBack = () => {
    // กลับไปหน้า accounting หลัก
    router.push('/accounting');
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    alert('Save functionality will be implemented - saving to database');
  };

  const handleDetail = async (row?: Accounting) => {
    try {
      if (row) {
        setEditingData(row); 
        setIsFormModalOpen(true);
      } else {
        setEditingData(null);
      }
    } catch (error) {
      console.error('Failed to load detail:', error);
      alert('Failed to load details');
    }
  };

  const dataWithRowNumbers = data.map((item, index) => ({
    ...item,
    no: index + 1
  }));

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
        
        <button
          onClick={handleSave}
          className="bg-[#0369A1] hover:bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium"
        >
          Save
        </button>
      </div>

      <div className="flex justify-between items-center px-4">       
        <h1 className="text-xl font-bold">Accounting Summary Report</h1>
        <div className="text-sm text-gray-600">
          {data.length} record(s) processed from {sourceFiles.length} file(s)
        </div>
      </div>

      <div className="p-4 mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Processing accounting data...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-64 bg-gray-50 rounded border">
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-2">No accounting data available</div>
              <div className="text-sm text-gray-500">Please go back and process some invoice files first</div>
            </div>
          </div>
        ) : (
          /* DataTable */
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
        )}

        {/* Form Modal */}
        {isFormModalOpen && (
          <AccountingForm
            showModal={isFormModalOpen}
            setShowModal={setIsFormModalOpen}
            editingData={editingData}
            onSave={async (updatedData) => {
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
                
                setData(prev => 
                  prev.map(item => 
                    item.id === result.id ? result : item
                  )
                );
                
                alert('Data updated successfully!');
              } catch (error) {
                console.error('Save failed:', error);
                alert('Save failed!');
              } finally {
                setLoading(false);
              }
            }}
          />
        )}
      </div>
    </>
  )
}