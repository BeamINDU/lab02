"use client";

import { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react';
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
  
  // Zoom Controls State
  const [imageControls, setImageControls] = useState({
    zoom: 1,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragStart: { x: 0, y: 0 }
  });

  useEffect(() => {
    if (editingData) {
      setFormData(editingData);
    }
    setIsEditMode(false);
    // Reset image controls when modal opens
    setImageControls({
      zoom: 0.5,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
      dragStart: { x: 0, y: 0 }
    });
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

  //  Image Control Handlers
  const handleZoomIn = () => {
    setImageControls(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.2, 3) // Max zoom 3x
    }));
  };

  const handleZoomOut = () => {
    setImageControls(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.2, 0.5) // Min zoom 0.5x
    }));
  };

  const handleResetToFitView = () => {
    setImageControls({
      zoom: 0.5, 
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
      dragStart: { x: 0, y: 0 }
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setImageControls(prev => ({
      ...prev,
      isDragging: true,
      dragStart: { x: e.clientX - prev.offsetX, y: e.clientY - prev.offsetY }
    }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageControls.isDragging) return;
    
    setImageControls(prev => ({
      ...prev,
      offsetX: e.clientX - prev.dragStart.x,
      offsetY: e.clientY - prev.dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setImageControls(prev => ({
      ...prev,
      isDragging: false
    }));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setImageControls(prev => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(3, prev.zoom + delta))
    }));
  };

  const imageUrl = editingData?.imageUrl || "/images/no-image-placeholder.png";

  //  Image Transform Style
  const imageTransform = `
    scale(${imageControls.zoom}) 
    rotate(${imageControls.rotation}deg) 
    translate(${imageControls.offsetX}px, ${imageControls.offsetY}px)
  `;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-6xl max-h-[95vh] overflow-hidden">
        
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
        <div className="flex h-[750px]">
          
          {/* Left Side - Image with Controls */}
          <div className="w-1/2 p-4 border-r relative">
            {/*  Image Control Buttons */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
              <button
                onClick={handleZoomIn}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={handleResetToFitView}
                className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                title="Fit to View (50%)"
              >
                <Move size={16} />
              </button>
            </div>

            {/*  Zoom Level Indicator */}
            <div className="absolute top-6 right-6 z-10 bg-black/70 text-white px-3 py-1 rounded text-sm">
              {Math.round(imageControls.zoom * 100)}%
            </div>

            {/*  Image Container with Zoom */}
            <div 
              className="w-full h-full border border-gray-300 bg-gray-50 overflow-hidden relative"
              onWheel={handleWheel}
            >
              {imageUrl && imageUrl !== "/images/no-image-placeholder.png" ? (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ cursor: imageControls.isDragging ? 'grabbing' : 'grab' }}
                >
                  <img 
                    src={imageUrl}
                    alt="Invoice Document"
                    className="max-w-none transition-transform duration-200 ease-out"
                    style={{
                      transform: imageTransform,
                      transformOrigin: 'center center'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onDragStart={(e) => e.preventDefault()} 
                    onError={(e) => {
                      console.warn('Failed to load image:', imageUrl);
                      (e.target as HTMLImageElement).src = "/images/no-image-placeholder.png";
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 h-full">
                  <div className="text-4xl mb-2">📄</div>
                  <div className="text-sm">No image available</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formData.filename || 'Unknown file'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Form (unchanged) */}
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