"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useToast from "../../hooks/useToast";
import MappingTemplateModal from "../../reading/components/MappingTemplateModal";
import ExportModal from "../../process/components/ExportModal";
import ImageEditModal, { AdjustmentValues } from "../../components/modal/ImageEditModal";
import FileTable from "../../reading/components/SourceFileTable";
import PreviewFile from "../../reading/components/PreviewFile"; 
import ConfirmModal from "../../components/modal/ConfirmModal";

//------------------------------------------------------------------------------

// Main component
export default function SettingTemplatePage() {
  const router = useRouter();

  const { toastSuccess } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState<string>("English");
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEditImageModalOpen, setEditImageModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adjustedValues, setAdjustedValues] = useState<AdjustmentValues | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [fileToDeleteIndex, setFileToDeleteIndex] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  if (typeof window !== "undefined") {
    // Create mock files only on the client-side
    const listFiles: File[] = [
      new File(["content"], "sample-invoice-1.png", { type: "image" }),
      new File(["content"], "sample-invoice-2.png", { type: "image" }),
      new File(["content"], "sample-invoice-1.pdf", { type: "pdf" }),
      new File(["content"], "sample-invoice-2.pdf", { type: "pdf" }),
      new File(["content"], "sample-invoice-3.pdf", { type: "pdf" }),
    ];
  
    setFiles(listFiles);
  }

  // Handlers for MappingTemplateModal
  const handleOpenMappingModal = () => setIsMappingModalOpen(true);
  const handleCloseMappingModal = () => setIsMappingModalOpen(false);

  const handleSaveFile = (file: File | null) => {
    if (file) {
      setFiles((prevFiles) => [...prevFiles, file]);
      toastSuccess(`File Saved: ${file.name}`);
    }
  };

  const handlePreviewFile = (file: File) => {
    setPreviewFile(file);
    // toastSuccess(`Previewing: ${file.name}`);
  };

  const confirmDeleteFile = (index: number) => {
    setFileToDeleteIndex(index);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteFile = () => {
    if (fileToDeleteIndex !== null) {
      const deletedFile = files[fileToDeleteIndex];
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== fileToDeleteIndex));
      toastSuccess(`File ${deletedFile.name} deleted successfully`);
    }
    setFileToDeleteIndex(null);
    setIsDeleteModalOpen(false);
  };

  // Handlers for ExportModal
  const handleOpenExportModal = () => setIsExportModalOpen(true);
  const handleCloseExportModal = () => setIsExportModalOpen(false);

  const handleSaveExport = (files: File[] | null) => {
    if (files) {
      const fileNames = files.map((file) => file.name);
      toastSuccess(`The result(s) have been saved to the database: ${fileNames.join(", ")}`);
    }
  };

  const handleExportTxt = (files: File[] | null) => {
    if (files) {
      toastSuccess(`Exported to text successfully.`);
    }
  };

  const handleSendExternal = (files: File[] | null) => {
    if (files) {
      toastSuccess(`The result(s) will be sent to the external system.`);
    }
  };

  // Handlers for ImageEditModal
  const handleOpenEditModal = (file: File) => {
    setCurrentFile(file);
    setEditImageModalOpen(true);
  };

  const handleSaveEdit = (values: AdjustmentValues) => {
    setAdjustedValues(values);
    toastSuccess(`Adjusted values saved for file: ${currentFile?.name}`);
    setEditImageModalOpen(false);
  };

  // Handlers for StartProcess
  const handleStartProcess = () => {
    setIsLoading(true);
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsLoading(false);
        // router.push("/process");
      }
    }, 100);
  };

  //------------------------------------------------------------------------------ 

  return (
    <div className="flex flex-col h-[100%] p-4 bg-gray-100">
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Source File Section */}
        <div className="flex flex-col">
          {/* Add Button */}
          <div className="mb-4">
            <button
              onClick={handleOpenMappingModal}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          {/* Source File Table */}
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-4">Source File</h2>
            {/* <FileTable
              files={files}
              onPreview={handlePreviewFile}
              onDelete={confirmDeleteFile}
              onEdit={handleOpenEditModal}
            /> */}
          </div>
        </div>
        {/* Preview Section */}
        <div className="flex flex-col">
          {/* Input Language Selection and Start Process */}
          <div className="flex items-center justify-between mb-4">
            {/* Input Language Selection */}
            <div className="flex items-center space-x-2 w-4/5">
              <label className="text-sm font-medium whitespace-nowrap" htmlFor="language-select">
                Input Language Selection
              </label>
              <select
                id="language-select"
                className="px-4 py-2 border rounded-md w-full"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Thai">Thai</option>
              </select>
            </div>

            {/* Start Process Button */}
              <button
                onClick={handleStartProcess}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Start Process
              </button>

              {isLoading && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center w-[400px]">
                    <div className="flex flex-col items-center">
                      {/* Loading Text */}
                      <div className="text-xl font-bold mb-1">Processing, please wait...</div>
                      {/* Image Spinner */}
                      <Image
                        src="/images/spinner.gif"
                        alt=""
                        width={70}
                        height={70}
                        className="mb-1 animate-spin"
                      />
                    </div>
                    {/* Progress Bar */}
                    <div className="relative w-full bg-gray-200 rounded-full">
                      <div
                        className="bg-blue-500 h-4 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">{progress}%</div>
                  </div>
                </div>
              )}
          </div>

          {/* Preview Section */}
          {/* <PreviewFile file={previewFile} /> */}
        </div>
      </div>

      {/* Modals */}
      <MappingTemplateModal
        isOpen={isMappingModalOpen}
        onClose={handleCloseMappingModal}
        onSave={handleSaveFile}
      />

      <ImageEditModal
        isOpen={isEditImageModalOpen}
        onClose={() => setEditImageModalOpen(false)}
        imageSrc={currentFile ? `/images/${currentFile.name}` : ""}
        onSave={handleSaveEdit}
      />

      {/* <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleCloseExportModal}
        files={files}
        onSave={handleSaveExport}
        onExportTxt={handleExportTxt}
        onSendExternal={handleSendExternal}
      /> */}
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete File"
        message={`Are you sure you want to delete this file ${
          fileToDeleteIndex !== null ? files[fileToDeleteIndex].name : ""
        }?`}
        actions={[
          { label: "NO", onClick: () => setIsDeleteModalOpen(false) },
          { label: "YES", onClick: handleDeleteFile },
        ]}
      />

    </div>

  );
}
