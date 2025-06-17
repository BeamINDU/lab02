// src/app/(protected)/accounting/components/accountingSaveModal.tsx
// ✅ ปรับปรุง Save Modal ให้แสดงข้อมูลที่ถูกต้อง

import React, { useState, useMemo } from "react";
import useToast from '@/app/hooks/useToast';
import { SourceFileData } from "@/app/lib/interfaces"

interface AccountingSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceFiles: SourceFileData[];
  onSave: (selectedFiles: SourceFileData[]) => void;
}

export default function AccountingSaveModal({
  isOpen,
  onClose,
  sourceFiles,
  onSave,
}: AccountingSaveModalProps) {
  const { toastError } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<SourceFileData[]>([]);

//  คำนวณจำนวน records ที่จะถูก save (ทุกหน้า)
  const saveableRecords = useMemo(() => {
    let totalRecords = 0;
    const fileDetails: Array<{ fileName: string; pages: number; validPages: number }> = [];

    sourceFiles.forEach(file => {
      // ✅ นับทุกหน้า ไม่ filter
      const totalPages = file.ocrResult?.length || 0;
      
      // นับหน้าที่มีข้อมูลจริงๆ (สำหรับแสดงข้อมูล)
      const validPages = file.ocrResult?.filter(page => {
        const reportData = (page as any).reportData;
        return reportData && (
          reportData.invoiceNo || 
          reportData.sellerName || 
          reportData.totalAmount > 0
        );
      }).length || 0;

      totalRecords += totalPages; // ✅ นับทุกหน้า
      fileDetails.push({
        fileName: file.fileName,
        pages: totalPages,
        validPages
      });
    });

    return { totalRecords, fileDetails };
  }, [sourceFiles]);

  //  คำนวณ records ที่เลือกแล้ว
  const selectedRecords = useMemo(() => {
    let totalSelected = 0;
    
    selectedFiles.forEach(file => {
      const validPages = file.ocrResult?.filter(page => {
        const reportData = (page as any).reportData;
        return reportData && (
          reportData.invoiceNo || 
          reportData.sellerName || 
          reportData.totalAmount > 0
        );
      }).length || 0;
      
      totalSelected += validPages;
    });

    return totalSelected;
  }, [selectedFiles]);
  
  const toggleSelectFile = (file: SourceFileData) => {
    setSelectedFiles((prev) => {
      const isSelected = prev.some((f) => f.id === file.id);
      return isSelected
      ? prev.filter((f) => f.id !== file.id)
      : [...prev, file];
    });
  };

  const toggleSelectAll = (isSelected: boolean) => {
    setSelectedFiles(isSelected ? [...sourceFiles] : []);
  };

  const handleSave = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toastError("No files selected for save.");
      return;
    }
    
    if (selectedRecords === 0) {
      toastError("No valid invoice records found in selected files.");
      return;
    }
    
    onSave(selectedFiles);
    resetState();
    onClose();
  };

  const resetState = () => {
    setSelectedFiles([]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-4 sm:p-6 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold">Save Accounting Records</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              ✕
            </button>
          </div>
  
          {/* File List - Scrollable */}
          <div className="rounded-md p-3 mb-4 flex-1 overflow-y-auto border min-h-0">
            {/* Select All Checkbox */}
            <label className="flex items-center mb-3 cursor-pointer bg-gray-50 p-2 rounded flex-shrink-0">
              <input
                type="checkbox"
                checked={selectedFiles.length === sourceFiles.length}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="hidden peer"
              />
              <div className="w-5 h-5 border-2 border-gray-400 rounded-md flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all">
                {selectedFiles.length === sourceFiles.length && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L7 13.586 4.707 11.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l9-9a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="ml-2 text-gray-700 font-medium">
                Select All Files ({sourceFiles.length})
              </span>
            </label>

            <div className="border-t pt-2">
              {sourceFiles?.map((item, index) => {
                const fileDetail = saveableRecords.fileDetails.find(f => f.fileName === item.fileName);
                const isSelected = selectedFiles.some((f) => f.id === item.id);
                
                return (
                  <label key={`save-item-${item.id}-${index}`} className="flex items-center mt-2 cursor-pointer hover:bg-gray-50 p-3 rounded border">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectFile(item)}
                      className="hidden peer"
                    />
                    <div className="w-5 h-5 border-2 border-gray-400 rounded-md flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all">
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L7 13.586 4.707 11.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l9-9a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {item.fileName}
                      </div>
                      {fileDetail && fileDetail.validPages !== fileDetail.pages && (
                        <div className="text-xs text-amber-600">
                          {fileDetail.pages - fileDetail.validPages} pages have no valid invoice data
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="border-t pt-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-center gap-2">
              <button
                onClick={onClose}
                className="text-white bg-[#818893] hover:bg-gray-600 font-semibold px-4 py-2 rounded-md text-sm w-full sm:w-24"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                disabled={selectedRecords === 0}
                className="text-white bg-[#0369A1] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold px-4 py-2 rounded-md text-sm w-full sm:w-auto"
              >
                Save ({selectedRecords})
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}