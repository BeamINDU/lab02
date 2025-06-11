'use client'

import { useState, useEffect } from "react";
import AccountingColumns from "./accounting-column";
import DataTable from "@/app/components/table/DataTable";
import AccountingForm from "./accounting-form";
import { Accounting } from "@/app/type/accounting";
import { Load, detail, update } from "@/app/lib/services/accounting";


export default function AccountingPage() {
  const [data, setData] = useState<Accounting[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingData, setEditingData] = useState<Accounting | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const result = await Load();
      setData(result);
    } catch (error) {
      console.error("Error search accounting:", error);
      alert('Error loading data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleSave = () => {
    alert('Save functionality will be implemented');
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
          className="bg-[#0369A1] hover:bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium"
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
        <h1 className="text-xl font-bold ">Summary Report</h1>
      </div>

      <div className="p-4 mx-auto">

        {/* DataTable */}
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