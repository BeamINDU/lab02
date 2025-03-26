"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useToast from "../hooks/useToast";
import { convertFileSizeToMB } from "../utils/format";
import MappingTemplateModal from "../components/modal/MappingTemplateModal";
import ExportModal from "../components/modal/ExportModal";
import ImageEditModal, { AdjustmentValues } from "../components/modal/ImageEditModal";
import SourceFileTable from "./components/SourceFileTable";
import PreviewFile from "./components/PreviewFile"; 
import MessageModal from "../components/modal/MessageModal";
import { SourceFileData } from "../interface/file"


export default function ReadingPage() {
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [language, setLanguage] = useState<string>("English");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditImageModalOpen, setEditImageModalOpen] = useState(false);
  
  const [adjustedValues, setAdjustedValues] = useState<AdjustmentValues | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [previewFile, setPreviewFile] = useState<SourceFileData>();

  const [fileToDeleteIndex, setFileToDeleteIndex] = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<SourceFileData[]>([]);

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const listFiles: SourceFileData[] = [
  //       {
  //         no: 1,
  //         file: new File(["content"], "sample-invoice-1.png", { type: "image/png" }),
  //         url: "/images/sample-invoice-1.png",
  //       },
  //       {
  //         no: 2,
  //         file: new File(["content"], "sample-invoice-2.png", { type: "image/png" }),
  //         url: "/images/sample-invoice-2.png",
  //       },
  //       {
  //         no: 3,
  //         file: new File(["content"], "sample-invoice-1.pdf", { type: "application/pdf" }),
  //         url: "/uploads/sample-invoice-1.pdf",
  //       },
  //       {
  //         no: 4,
  //         file: new File(["content"], "sample-invoice-2.pdf", { type: "application/pdf" }),
  //         url: "/uploads/sample-invoice-2.pdf",
  //       },
  //       {
  //         no: 5,
  //         file: new File(["content"], "sample-invoice-3.pdf", { type: "application/pdf" }),
  //         url: "/uploads/sample-invoice-3.pdf",
  //       },
  //     ];
  //     setFiles(listFiles);
  //   }
  // }, []);

  // Handlers for ImageEditModal
  const handleOpenEditModal = (file: File) => {
    setSelectedFile(file);
    setEditImageModalOpen(true);
  };

  const handleSaveEdit = (values: AdjustmentValues) => {
    setAdjustedValues(values);
    toastSuccess(`Adjusted values saved for file: ${selectedFile?.name}`);
    setEditImageModalOpen(false);
  };

  // Handlers for StartProcess
  const handleStartProcess = () => {
    setLoading(true);
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setLoading(false);
        // router.push("/process");
      }
    }, 100);
  };

  // Handlers for Add
  const handleAdd = () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    // setLoading(true);
  
    const files = e.target.files;
    if (!files || files.length === 0) {
      toastError("No files selected.");
      setLoading(false);
      return;
    }
  
    const allowedExtensions = ["pdf", "png", "jpg"];
    const maxSizeMB = 10;
    const newFilesData: SourceFileData[] = [];
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      const fileSizeInMB = convertFileSizeToMB(file.size);
  
      // Validate file type
      if (!allowedExtensions.includes(fileExtension)) {
        toastError(`Invalid file type for ${file.name}. Only PDF, PNG, and JPG are allowed.`);
        continue; // Skip the invalid file and move to the next one
      }
  
      // Validate file size
      if (parseFloat(fileSizeInMB) > maxSizeMB) {
        toastError(`File ${file.name} is too large. Max size is ${maxSizeMB} MB.`);
        continue; // Skip the invalid file and move to the next one
      }
  
      // Create a new file data object for valid files
      const newFileData: SourceFileData = {
        no: files.length + 1,
        file: file,
        url: URL.createObjectURL(file),  // Generate a temporary URL for the file
      };
  
      newFilesData.push(newFileData);
    }
  
    if (newFilesData.length > 0) {
      // Update the state by adding the valid file data to the list
      setFiles((prevFiles) => [...prevFiles, ...newFilesData]);
      toastSuccess(`${newFilesData.length} file(s) added successfully.`);
    }
  
    e.target.value = "";
    // setLoading(false);
  };
  
  // Handlers for Delete
  const confirmDeleteFile = (index: number) => {
    setFileToDeleteIndex(index);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteFile = () => {
    if (fileToDeleteIndex !== null) {
      const deletedFile = files[fileToDeleteIndex];
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== fileToDeleteIndex));
      toastSuccess(`File ${deletedFile.file?.name} deleted successfully`);
    }
    setFileToDeleteIndex(null);
    setIsDeleteModalOpen(false);
  };

  // Handlers for PreviewFile
  const handlePreviewFile = (file: SourceFileData) => {
    // toastSuccess(`Previewing: ${file.file?.name}`);
    setPreviewFile(file);
  };



  return (
    <div className="flex flex-col h-[100%] p-4 bg-gray-100">
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Source File Section */}
        <div className="flex flex-col">
          {/* Add Button */}
          <div className="mb-4">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-[#0369A1] text-white rounded-md hover:bg-blue-800"
            >
              Add
            </button>
            {/* Invisible File */}
            <input
              multiple
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {/* Source File Table */}
          <div className="">
            <h2 className="text-black text-lg font-bold">Source File</h2>
            <SourceFileTable
              files={files}
              onPreview={handlePreviewFile}
              onDelete={confirmDeleteFile}
              onEdit={handleOpenEditModal}
            />
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
              className="px-4 py-2 bg-[#0369A1] text-white rounded-md hover:bg-blue-600"
            >
              Start Process
            </button>

            {loading && (
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
          <PreviewFile items={previewFile ?? null} />
        </div>
      </div>

      {/* Modals */}
      {/* <MappingTemplateModal
        isOpen={isMappingModalOpen}
        onClose={handleCloseMappingModal}
        onSave={handleSaveFile}
      /> */}

      <ImageEditModal
        isOpen={isEditImageModalOpen}
        onClose={() => setEditImageModalOpen(false)}
        imageSrc={selectedFile ? `/images/${selectedFile}` : ""}
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
      
      <MessageModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete File"
        message={`Are you sure you want to delete this file ${
          fileToDeleteIndex !== null ? files[fileToDeleteIndex]?.file?.name : ""
        }?`}
        actions={[
          { label: "NO", onClick: () => setIsDeleteModalOpen(false) },
          { label: "YES", onClick: handleDeleteFile },
        ]}
      />
    </div>
  );
}
