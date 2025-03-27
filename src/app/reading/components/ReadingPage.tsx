"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useToast from "../../hooks/useToast";

import { useDispatch, useSelector } from 'react-redux';
import { setLanguage, setFiles, addFile, removeFile, updateFile } from '../../store/slices/fileSlice';
import { RootState } from '../../store/store';

import ImageEditModal, { AdjustmentValues } from "../../components/modal/ImageEditModal";
import SourceFileTable from "./SourceFileTable";
import PreviewFile from "./PreviewFile";
import ConfirmModal from "../../components/modal/ConfirmModal";

import { convertFileSizeToMB } from "../../utils/format";
import { SourceFileData } from "../../interface/file"

const optionsLanguage = ['English', 'Japan', 'Thai'];

export default function ReadingPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const language = useSelector((state: RootState) => state.files.language);
  const files = useSelector((state: RootState) => state.files.files);

  const { toastSuccess, toastError } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditImageModalOpen, setEditImageModalOpen] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [filePreview, setFilePreview] = useState<SourceFileData | null>(null);
  const [fileToDeleteIndex, setFileToDeleteIndex] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<SourceFileData | undefined>(undefined);

  const [adjustedValues, setAdjustedValues] = useState<AdjustmentValues | null>(null);

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handlers for ImageEditModal
  const handleOpenEditModal = (file: SourceFileData) => {
    setSelectedFile(file);
    setEditImageModalOpen(true);
  };

  const handleSaveEdit = (values: AdjustmentValues) => {
    setAdjustedValues(values);
    toastSuccess(`Adjusted values saved for file: ${selectedFile?.fileName}`);
    setEditImageModalOpen(false);
  };

  // Handlers for StartProcess
  const handleStartProcess = () => {
    if (!files || files.length === 0) {
      toastError("No source file.");
      setLoading(false);
      return;
    }

    dispatch(setLanguage(language));
    dispatch(setFiles(files));
    router.push('/process');
  };

  // Handlers for Add
  const handleAdd = () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
  
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      toastError("No files selected.");
      setLoading(false);
      return;
    }
  
    const allowedExtensions = ["pdf", "png", "jpg"];
    const maxSizeMB = 10;
    const newFilesData: SourceFileData[] = [];
  
    // แปลง FileList เป็น Array
    const selectedFilesArray: File[] = [...selectedFiles]
  
    for (let i = 0; i < selectedFilesArray.length; i++) {
      const file = selectedFilesArray[i];
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      const fileSizeInMB = convertFileSizeToMB(file.size);
  
      // ตรวจสอบประเภทไฟล์
      if (!allowedExtensions.includes(fileExtension)) {
        toastError(`Invalid file type for ${file.name}. Only PDF, PNG, and JPG are allowed.`);
        continue;
      }
  
      // ตรวจสอบขนาดไฟล์
      if (parseFloat(fileSizeInMB) > maxSizeMB) {
        toastError(`File ${file.name} is too large. Max size is ${maxSizeMB} MB.`);
        continue;
      }
  
      // สร้างข้อมูลไฟล์ใหม่สำหรับไฟล์ที่ถูกต้อง
      const newFileData: SourceFileData = {
        no: selectedFilesArray.length + 1, // เพิ่มหมายเลขที่ไม่ซ้ำ หรือสร้างหมายเลขนี้ตามต้องการ
        // file: file,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        url: URL.createObjectURL(file),
      };
  
      newFilesData.push(newFileData);
    }
  
    if (newFilesData.length > 0) {
      // แปลงไฟล์ที่มีอยู่แล้วใน Redux store (สมมุติว่าเป็น SourceFileData[] แล้ว)
      const existingFiles: SourceFileData[] = files;
  
      // รวมไฟล์ใหม่กับไฟล์ที่มีอยู่แล้ว
      const updatedFilesData = [...existingFiles, ...newFilesData];
  
      // ส่งข้อมูลไฟล์ที่รวมกันแล้วไปยัง Redux store
      dispatch(setFiles(updatedFilesData)); // จะอัพเดตไฟล์ใน Redux store
      toastSuccess(`${newFilesData.length} file(s) added successfully.`);
    }
  
    e.target.value = "";
    setLoading(false);
  };
  

  // Handlers for Delete
  const confirmDeleteFile = (index: number) => {
    setFileToDeleteIndex(index);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteFile = () => {
    if (fileToDeleteIndex !== null) {
      const deletedFile = files[fileToDeleteIndex];
      dispatch(setFiles(files.filter((_, i) => i !== fileToDeleteIndex)));
      toastSuccess(`File ${deletedFile.fileName} deleted successfully`);
    }
    setFileToDeleteIndex(null);
    setIsDeleteModalOpen(false);
  };

  // Handlers for PreviewFile
  const handlePreviewFile = (file: SourceFileData) => {
    setFilePreview(file);
  };

  return (
    <div className="flex flex-col h-[100%] p-4 bg-gray-100">
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Source File Section */}
        <div className="flex flex-col">
          <div className="mb-4">
            <button
              onClick={handleAdd}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-24"
            >
              Add
            </button>
            <input
              multiple
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div className="">
            <h2 className="text-black text-lg font-bold">Source File</h2>
            <SourceFileTable
              fileData={files}
              onPreview={handlePreviewFile}
              onDelete={confirmDeleteFile}
              onEdit={handleOpenEditModal}
            />
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 w-4/5">
              <label className="text-sm font-medium whitespace-nowrap" htmlFor="language-select">
                Input Language Selection
              </label>
              <select
                id="language-select"
                className="px-4 py-2 border rounded-md w-full"
                value={language}
                onChange={(e) => dispatch(setLanguage(e.target.value))}
              >
                {optionsLanguage.map((lang, index) => (
                  <option key={index} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStartProcess}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-32"
            >
              Start Process
            </button>
          </div>

          <PreviewFile fileData={filePreview ?? null} />
        </div>
      </div>

      <ImageEditModal
        isOpen={isEditImageModalOpen}
        onClose={() => setEditImageModalOpen(false)}
        imageSrc={selectedFile ? selectedFile.url : ""}
        onSave={handleSaveEdit}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete File"
        message={`Are you sure you want to delete this file ${fileToDeleteIndex !== null ? files[fileToDeleteIndex]?.fileName : ""
          }?`}
        actions={[
          { label: "NO", onClick: () => setIsDeleteModalOpen(false) },
          { label: "YES", onClick: handleDeleteFile },
        ]}
      />
    </div>
  );
}
