import React, { useState, useEffect, useRef } from "react";
import useToast from '@/app/hooks/useToast';
import { SourceFileData } from "@/app/lib/interfaces"
import { ExportExcel, ExportWord, ExportText } from '@/app/lib/exports';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceFiles: SourceFileData[];
  // onExportTxt: (selectedFiles: SourceFileData[]) => void;
  // onSendExternal: (selectedFiles: SourceFileData[]) => void;
}

export default function ExportModal({
  isOpen,
  onClose,
  sourceFiles,
  // onExportTxt,
  // onSendExternal,
}: ExportModalProps) {
  const { toastSuccess, toastError } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<SourceFileData[]>([]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const ExportType = {
    Text: "txt",
    Excel: "xlsx",
    Word: "docx",
  } as const;
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
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

  const handleExport = (exportType: "txt" | "xlsx" | "docx") => {
    if (selectedFiles.length === 0) {
      toastError("Please select at least one file.");
      return;
    }

    selectedFiles.forEach((file) => {
      const fileNameWithoutExtension = file.fileName.split('.').slice(0, -1).join('.');
      const content = file.ocrResult?.map(r => r.extractedText).join('\n\n') || '';

      switch (exportType) {
        case ExportType.Text:
          ExportText(content, fileNameWithoutExtension);
          break;
        case ExportType.Excel:
          ExportExcel(content, fileNameWithoutExtension);
          break;
        case ExportType.Word:
          ExportWord(content, fileNameWithoutExtension);
          break;
      }
    });

    setShowExportOptions(false);
    resetState();
    onClose();
  };

  const resetState = () => {
    setSelectedFiles([]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2 sm:px-0">
        <div className="bg-white rounded-lg shadow-lg w-full h-full sm:h-[60vh] sm:max-w-4xl p-4 sm:p-6 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Export</h2>
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
                checked={selectedFiles.length === sourceFiles.length}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="hidden peer"
              />
              <div className="w-5 h-5 border-2 border-gray-400 rounded-md flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all">
                {selectedFiles.length === sourceFiles.length && (
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
              {sourceFiles?.map((item, index) => (
                <label key={index} className="flex items-center mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFiles.some((f) => f.id === item.id)}
                    onChange={() => toggleSelectFile(item)}
                    className="hidden peer"
                  />
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-md flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all">
                    {selectedFiles.some((f) => f.id === item.id) && (
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
                  <span className="ml-2 text-gray-700 font-medium">{item.fileName}</span>
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

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-full sm:w-32"
              >
                Export
                {/* Export {showExportOptions ? "▲" : "▼"} */}
              </button>

              {showExportOptions && (
                <div className="absolute right-0 bottom-full mb-2 w-full sm:w-32 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => {
                      handleExport(ExportType.Text);
                      // setShowExportOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Export .txt
                  </button>
                  <button
                    onClick={() => {
                      handleExport(ExportType.Excel);
                      // setShowExportOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Export .xlsx
                  </button>
                  <button
                    onClick={() => {
                      handleExport(ExportType.Word);
                      // setShowExportOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Export .docx
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
  
};
