'use client'

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import AccountingColumns, { AccountingData } from "./accounting-column";

// Mock data สำหรับ demo ตามภาพ
const mockData: AccountingData[] = [
  {
    id: "1",
    invoiceDate: "RVG0325-037",
    invoiceNo: "RVG0325-037", 
    sellerName: "นบอน แคนดี้ ช็อคโกแลต คิทแคท",
    sellerTaxId: "0105533066170",
    branch: "-",
    productValue: 10000.00,
    vat: 700.00,
    totalAmount: 10700.00,
    filename: "testfile.jpg"
  },
  {
    id: "2",
    invoiceDate: "2025-02-10",
    invoiceNo: "YT250200322",
    sellerName: "นบอน วาฟเฟอร์ กลิ่นแบนิลา", 
    sellerTaxId: "0105533066170",
    branch: "00000",
    productValue: 1236.00,
    vat: 86.52,
    totalAmount: 1322.52,
    filename: "page4.jpg"
  }
];

export default function AccountingPage() {
  const { register, getValues, setValue, reset, control } = useForm(); 
  const [data, setData] = useState<AccountingData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingData, setEditingData] = useState<AccountingData | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    try {
      // ใช้ mock data แทน API call
      setData(mockData);
    } catch (error) {
      console.error("Error search accounting:", error);
      setData([]);
    }
  };

  const handleBack = () => {
    // Navigate back functionality
    window.history.back();
  };

  const handleSave = () => {
    // Save functionality
    alert('Save functionality will be implemented');
  };

  const handleDetail = async (row?: AccountingData) => {
    try {
      if (row) {
        setEditingData(row); 
        // ในอนาคตสามารถเรียก API detail ได้ที่นี่
        alert(`Checking file: ${row.filename}`);
      } else {
        reset();
        setEditingData(null);
      }
      // สามารถเปิด modal ได้ที่นี่
      // setIsFormModalOpen(true);
    } catch (error) {
      console.error('Failed to load detail:', error);
      alert('Failed to load details');
    }
  };

  // เพิ่ม row number ให้กับข้อมูล
  const dataWithRowNumbers = data.map((item, index) => ({
    ...item,
    no: index + 1
  }));

  return (
    <>
      {/* Header with Back and Save buttons */}
      <div className="flex justify-between items-center mb-6 px-4">
        <button
          onClick={handleBack}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium"
        >
          Back
        </button>
        
        <h2 className="text-xl font-bold">Summary Report</h2>
        
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium"
        >
          Save
        </button>
      </div>

      <div className="p-4 mx-auto">
        {/* DataTable using AccountingColumns */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-200 text-sm font-medium">
                {AccountingColumns({
                  showCheckbox: false, // ปิด checkbox ตามภาพ
                  canEdit: true,
                  openDetailModal: handleDetail,
                  selectedIds,
                  setSelectedIds,
                  data: dataWithRowNumbers,
                }).map((column, index) => (
                  <th 
                    key={index}
                    className="border border-gray-300 px-4 py-3 text-left text-black"
                    style={column.meta?.style}
                  >
                    {typeof column.header === 'function' ? column.header({} as any) : column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataWithRowNumbers.map((row, rowIndex) => (
                <tr key={row.id} className={`text-sm ${rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}>
                  {AccountingColumns({
                    showCheckbox: false,
                    canEdit: true, 
                    openDetailModal: handleDetail,
                    selectedIds,
                    setSelectedIds,
                    data: dataWithRowNumbers,
                  }).map((column, colIndex) => (
                    <td 
                      key={colIndex}
                      className="border border-gray-300 px-4 py-3"
                      style={column.meta?.style}
                    >
                      {column.cell ? 
                        column.cell({ 
                          getValue: () => row[column.accessorKey as keyof AccountingData],
                          row: { original: row },
                        } as any) : 
                        row[column.accessorKey as keyof AccountingData]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form Modal Placeholder */}
        {isFormModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h3 className="text-lg font-bold mb-4">Detail Modal</h3>
              <p>File: {editingData?.filename}</p>
              <button 
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setIsFormModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}