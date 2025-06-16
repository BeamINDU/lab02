import React, { useState } from "react";
import useToast from '@/app/hooks/useToast';
import { Accounting } from "@/app/type/accounting";
import { ExportExcel } from '@/app/lib/exports';

interface AccountingExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountingData: Accounting[];
}

export default function AccountingExportModal({
  isOpen,
  onClose,
  accountingData,
}: AccountingExportModalProps) {
  const { toastSuccess, toastError } = useToast();
  const [selectedItems, setSelectedItems] = useState<Accounting[]>([]);
  
  const toggleSelectItem = (item: Accounting) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((i) => i.id === item.id);
      return isSelected
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item];
    });
  };

  const toggleSelectAll = (isSelected: boolean) => {
    setSelectedItems(isSelected ? [...accountingData] : []);
  };

  const handleExport = () => {
    if (selectedItems.length === 0) {
      toastError("Please select at least one item.");
      return;
    }

    try {
      // สร้าง header สำหรับตาราง
      const headers = [
        'No.',
        'Invoice Date',
        'Invoice No',
        'Seller Name', 
        'Seller Tax ID',
        'Branch',
        'Product Value',
        'VAT',
        'Total Amount',
        'Filename'
      ];

      // แปลงข้อมูลเป็นรูปแบบตาราง
      const tableData = selectedItems.map((item, index) => [
        index + 1,
        item.invoiceDate,
        item.invoiceNo,
        item.sellerName,
        item.sellerTaxId,
        item.branch,
        item.productValue.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        item.vat.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        item.filename
      ]);

      // สร้างข้อมูลในรูปแบบ Markdown table
      const exportData = [
        // Header row
        `| ${headers.join(' | ')} |`,
        // Separator row
        `| ${headers.map(() => '---').join(' | ')} |`,
        // Data rows
        ...tableData.map(row => `| ${row.join(' | ')} |`)
      ].join('\n');

      // สร้างชื่อไฟล์ตามวันที่
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `accounting_summary_${currentDate}`;

      // Export Excel ทันที
      ExportExcel(exportData, filename);

      toastSuccess(`Exported ${selectedItems.length} item(s) to Excel successfully!`);
      resetState();
      onClose();
      
    } catch (error) {
      console.error('Export error:', error);
      toastError("Export failed. Please try again.");
    }
  };

  const resetState = () => {
    setSelectedItems([]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2 sm:px-0">
        <div className="bg-white rounded-lg shadow-lg w-full h-full sm:h-[60vh] sm:max-w-4xl p-4 sm:p-6 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Export Accounting Data</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">
              ✕
            </button>
          </div>
  
          {/* File List */}
          <div className="rounded-md p-3 mb-4 flex-1 overflow-y-auto border">
            {/* Select All Checkbox */}
            <label className="flex items-center mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedItems.length === accountingData.length}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="hidden peer"
              />
              <div className="w-5 h-5 border-2 border-gray-400 rounded-md flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all">
                {selectedItems.length === accountingData.length && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L7 13.586 4.707 11.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l9-9a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="ml-2 text-gray-700 font-medium">Select All</span>
            </label>
  
            <div className="border-t">
              {accountingData?.map((item, index) => (
                <label key={`export-item-${item.id}-${index}`} className="flex items-center mt-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedItems.some((i) => i.id === item.id)}
                    onChange={() => toggleSelectItem(item)}
                    className="hidden peer"
                  />
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-md flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all">
                    {selectedItems.some((i) => i.id === item.id) && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L7 13.586 4.707 11.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l9-9a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {item.invoiceNo} - {item.sellerName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.invoiceDate} | Total: {item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
  
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 mt-auto">
            <button
              onClick={onClose}
              className="text-white bg-[#818893] hover:bg-gray-600 font-semibold px-4 py-2 rounded-md text-sm w-full sm:w-24"
            >
              Close
            </button>

            <button
              onClick={handleExport}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-full sm:w-32 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={selectedItems.length === 0}
            >
              Export ({selectedItems.length})
            </button>
          </div>
        </div>
      </div>
    </>
  );
}