"use client";

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Accounting } from "@/app/type/accounting";

interface AccountingFormModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  editingData: Accounting | null;
  onSave?: (formData: Accounting) => void;
}

export default function AccountingForm({
  showModal,
  setShowModal,
  editingData,
  onSave
}: AccountingFormModalProps) {
  const [formData, setFormData] = useState<Accounting>({
    id: "",
    invoiceDate: "",
    invoiceNo: "",
    sellerName: "",
    sellerTaxId: "",
    branch: "",
    productValue: 0,
    vat: 0,
    totalAmount: 0,
    filename: ""
  });

  const [isEditMode, setIsEditMode] = useState(false); 

  useEffect(() => {
    if (editingData) {
      setFormData(editingData);
    }

    setIsEditMode(false);
  }, [editingData]);

  if (!showModal) return null;

  const handleInputChange = (field: keyof Accounting, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = () => {
    setIsEditMode(!isEditMode);
  };

  const handleClose = () => {
    setIsEditMode(false);
    setShowModal(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setShowModal(false);
  };

  // Mock image URL for demo
  const imageUrl = "/images/takumi-pic.png"; 

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-5xl max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-100 px-4 py-2 flex justify-between items-center border-b">
          <h3 className="text-lg font-medium">{formData.filename}</h3>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className={`px-4 py-1 rounded text-sm font-medium ${
                isEditMode 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-gray-400 hover:bg-gray-500 text-white'
              }`}
            >
              {isEditMode ? 'Cancel' : 'Edit'}
            </button>
            {isEditMode && (
              <button
                onClick={handleSave}
                className="bg-[#0369A1] hover:bg-blue-600 text-white px-4 py-1 rounded text-sm font-medium"
              >
                Save
              </button>
            )}
            <button
              onClick={handleClose}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[700px]">
          
          {/* Left Side - Image */}
          <div className="w-1/2 p-4 border-r">
            <div className="w-full h-full border border-gray-300 flex items-center justify-center bg-gray-50">
              <img 
                src={imageUrl}
                alt="Invoice Document"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-1/2 p-4 overflow-y-auto">
            <div className="space-y-3">
              
              {/* Invoice Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date
                </label>
                <input
                  type="text"
                  value={formData.invoiceDate}
                  onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${
                    isEditMode 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  readOnly={!isEditMode}
                />
              </div>

              {/* Invoice No. */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice No.
                </label>
                <input
                  type="text"
                  value={formData.invoiceNo}
                  onChange={(e) => handleInputChange('invoiceNo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${
                    isEditMode 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  readOnly={!isEditMode}
                />
              </div>

              {/* Seller Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seller Name
                </label>
                <input
                  type="text"
                  value={formData.sellerName}
                  onChange={(e) => handleInputChange('sellerName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${
                    isEditMode 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  readOnly={!isEditMode}
                />
              </div>

              {/* Seller Tax ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seller Tax ID
                </label>
                <input
                  type="text"
                  value={formData.sellerTaxId}
                  onChange={(e) => handleInputChange('sellerTaxId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${
                    isEditMode 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  readOnly={!isEditMode}
                />
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${
                    isEditMode 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  readOnly={!isEditMode}
                />
              </div>

              {/* Product Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Value
                </label>
                <input
                  type="number"
                  value={formData.productValue}
                  onChange={(e) => handleInputChange('productValue', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${
                    isEditMode 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  step="0.01"
                  readOnly={!isEditMode}
                />
              </div>

              {/* Vat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vat
                </label>
                <input
                  type="number"
                  value={formData.vat}
                  onChange={(e) => handleInputChange('vat', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${
                    isEditMode 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  step="0.01"
                  readOnly={!isEditMode}
                />
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${
                    isEditMode 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  step="0.01"
                  readOnly={!isEditMode}
                />
              </div>

              {/* Filename */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filename
                </label>
                <input
                  type="text"
                  value={formData.filename}
                  onChange={(e) => handleInputChange('filename', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded text-sm cursor-not-allowed"
                  readOnly 
                />
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}