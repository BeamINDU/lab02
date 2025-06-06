import React, { useState } from "react";
import ConfirmModal from "@/app/components/modal/ConfirmModal";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File | null) => void;
}

const MappingTemplateModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(selectedFile);
    resetState();
    onClose();
  };

  const handleCancel = () => {
    if (selectedFile) {
      setIsCancelModalOpen(true);
    } else {
      onClose();
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsCancelModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-black text-xl font-semibold">MAPPING WITH TEMPLATES</h2>
          <button onClick={onClose} className="text-xl text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>
        <hr className="my-4" />

        {/* Content */}
        <div className="flex gap-6">
          {/* File Input & Preview */}
          <div className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-4 w-1/3">
            <label className="flex flex-col items-center justify-center cursor-pointer bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600">
              Browse
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="mt-4 max-w-full max-h-36 rounded-lg border border-gray-300"
              />
            )}
          </div>

          {/* Template Section */}
          <div className="flex-1 border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              {["Text File", "85% template_1", "76% template_2"].map((text, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center h-36 border border-gray-300 rounded-lg text-sm text-center bg-gray-100"
                >
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedFile}
            className={`px-4 py-2 rounded-md ${
              selectedFile
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>

        {/* Cancel Confirmation Modal */}
        <ConfirmModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="CANCEL"
          message="There are unsaved changes. Do you want to continue without saving?"
          actions={[
            { label: "NO", onClick: () => setIsCancelModalOpen(false) },
            { label: "YES", onClick: () => { resetState(); onClose(); } },
          ]}
        />
        
      </div>
    </div>
  );
};

export default MappingTemplateModal;
