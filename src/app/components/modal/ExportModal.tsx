import React, { useState } from "react";
import useToast from '../../hooks/useToast';


interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
  onSave: (selectedFiles: File[]) => void;
  onExportTxt: (selectedFiles: File[]) => void;
  onSendExternal: (selectedFiles: File[]) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  files,
  onSave,
  onExportTxt,
  onSendExternal,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toastSuccess, toastError, toastInfo, toastWarning } = useToast();

  const toggleSelectFile = (file: File) => {
    setSelectedFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
    );
  };

  const toggleSelectAll = (isSelected: boolean) => {
    setSelectedFiles(isSelected ? files : []);
  };

  const handleAction = (
    action: 'save' | 'exportTxt' | 'sendExternal',
    selectedFiles: File[]
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
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Export</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              ✕
            </button>
          </div>
          {/* <hr className="my-4" /> */}

          {/* File List */}
          <div className="border rounded-md p-4 mb-4">
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectedFiles.length === files.length}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="mr-2"
              />
              <span>Select All</span>
            </label>
            <div className="border-t">
              {files.map((file, index) => (
                <label key={index} className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file)}
                    onChange={() => toggleSelectFile(file)}
                    className="mr-2"
                  />
                  <span>{file.name}</span> {/* Display file name */}
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleAction('save', selectedFiles)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
            >
              Save
            </button>
            <button
              onClick={() => handleAction('exportTxt', selectedFiles)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
            >
              Export .txt
            </button>
            <button
              onClick={() => handleAction('sendExternal', selectedFiles)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
            >
              Send External
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExportModal;
