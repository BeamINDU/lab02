import React, { useState } from "react";
import useToast from '@/app/hooks/useToast';
import { SourceFileData } from "@/app/lib/interfaces"

// interface OptionProps {
//   label: string;
//   value: string;
// }

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceFiles: SourceFileData[];
  onSave: (selectedFiles: SourceFileData[]) => void;
  onExportTxt: (selectedFiles: SourceFileData[]) => void;
  onSendExternal: (selectedFiles: SourceFileData[]) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  sourceFiles,
  onSave,
  onExportTxt,
  onSendExternal,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<SourceFileData[]>([]);
  const { toastSuccess, toastError, toastInfo, toastWarning } = useToast();

  
  const toggleSelectFile = (file: SourceFileData) => {
    setSelectedFiles((prev) => {
      const isSelected = prev.some((f) => f.fileName === file.fileName);
      return isSelected
      ? prev.filter((f) => f.fileName !== file.fileName)
      : [...prev, file];
    });
  };

  const toggleSelectAll = (isSelected: boolean) => {
    setSelectedFiles(isSelected ? [...sourceFiles] : []);
  };

  const handleAction = (
    action: 'save' | 'exportTxt' | 'sendExternal',
    selectedFiles: SourceFileData[]
  ) => {
    if (selectedFiles.length === 0) {
      toastError("Please select at least one file.");
      return;
    }

    switch (action) {
      case 'save':
        onSave(selectedFiles);
        break;
      case 'exportTxt':
        onExportTxt(selectedFiles);
        break;
      case 'sendExternal':
        onSendExternal(selectedFiles);
        break;
      default:
        break;
    }

    resetState();
    onClose();
  };

  const resetState = () => {
    setSelectedFiles([]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 h-[60vh]">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Export</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              ✕
            </button>
          </div>
          {/* <hr className="my-4" /> */}

          <div className="flex flex-col justify-between h-full">
            {/* File List */}
            <div className="rounded-md p-4 mb-4 min-h-[45vh] overflow-y-auto border">
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
                      checked={selectedFiles.some((f) => f.fileName === item.fileName)}
                      onChange={() => toggleSelectFile(item)}
                      className="hidden peer"
                    />
                    <div className="w-5 h-5 border-2 border-gray-400 rounded-md flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all">
                      {selectedFiles.some((f) => f.fileName === item.fileName) && (
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
            <div className="flex justify-center gap-2 mt-auto mb-10">
              <button
                onClick={onClose}
                className="text-white bg-[#818893] hover:bg-grey-600 font-semibold px-4 py-2 rounded-md text-sm w-24"
              >
                Close
              </button>
              <button
                onClick={() => handleAction('save', selectedFiles)}
                className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-32"
              >
                Save
              </button>
              <button
                onClick={() => handleAction('exportTxt', selectedFiles)}
                className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-32"
              >
                Export .txt
              </button>
              <button
                onClick={() => handleAction('sendExternal', selectedFiles)}
                className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-32"
              >
                Send External
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ExportModal;
