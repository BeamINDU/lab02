"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { ChartBarIcon, LanguagesIcon, HistoryIcon, FileTextIcon, Settings2Icon } from 'lucide-react';
import Image from "next/image";
import CloseBTN from "../components/_temp/CloseBTN";
import LanguageDropdown from "../components/_temp/LanguageDropdown";
import CustomAlert from '../components/_temp/CustomAlert';
import SuccessMessage from '../components/_temp/SuccessMessage';

interface FileData {
  No: number;
  fileName: string;
  preview?: string;
}

export default function ReadingPage() {
  const router = useRouter();

  const [isAddNewSourceFileBTNOpen, setAddNewSourceFileBTNOpen] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [modalPreview, setModalPreview] = useState<FileData | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [showAlert, setShowAlert] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const preview = URL.createObjectURL(selectedFile);
      setModalPreview({
        No: files.length + 1,
        fileName: selectedFile.name,
        preview: preview
      });
    }
  };

  const handleSave = () => {
    if (modalPreview) {
      setFiles([...files, modalPreview]);
      setModalPreview(null);
      setAddNewSourceFileBTNOpen(false);
      
      // Reset file input after saving
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  
      // Show success message
      setShowSuccess(true);
      
      // Auto hide after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 1500);
    }
  };
  
  const handleCancelConfirm = () => {
    if (modalPreview?.preview) {
      URL.revokeObjectURL(modalPreview.preview);
    }
    setModalPreview(null);
    setAddNewSourceFileBTNOpen(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelClick = () => {
    if (modalPreview) {
      setShowAlert(true);
    } else {
      handleCancelConfirm();
    }
  };

  const handleDelete = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    // Revoke the URL to prevent memory leaks
    if (files[index].preview) {
      URL.revokeObjectURL(files[index].preview!);
    }
    // Reindex the remaining files
    const reindexedFiles = updatedFiles.map((file, i) => ({
      ...file,
      No: i + 1
    }));
    setFiles(reindexedFiles);
    
    // Clear preview if the deleted file was being previewed
    if (selectedPreview === files[index].preview) {
      setSelectedPreview(null);
    }
  };

  const handlePreview = (preview: string) => {
    setSelectedPreview(preview);
  };

  const openFileExplorer = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleStartProcess = () => {
    setIsLoading(true);
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsLoading(false);
        router.push("/process");
      }
    }, 100); // เพิ่ม progress ทุก 200ms
  };

  return (
    <div className="w- text-black grid grid-cols-2 gap-10 p-10">
      <div>
        <input 
          // multiple
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
        />
        
        <div>
          <button
            className="text-white font-semibold px-4 py-1 rounded-lg bg-[#0369A1] hover:bg-[#9c9a9a] active:scale-95 transition transform duration-150 mr-8"
            onClick={() => {setAddNewSourceFileBTNOpen(true)}}
          >
            Add +
          </button>

          {isAddNewSourceFileBTNOpen && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white shadow-lg max-w-[850px] min-h-[650px] w-full">

                <div className="flex justify-between bg-[#64748B] h-[42px]">
                  <div className="text-white font-bold content-center ms-2">
                    MAPPING WITH TEMPLATES
                  </div>
                  <div className="content-center mr-1">
                    <CloseBTN onClick={() => setAddNewSourceFileBTNOpen(false)} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 p-6 h-full gap-6">
                  <div className="bg-white border border-gray-300 rounded-lg shadow-inner p-4 h-[500px] flex items-center justify-center">

                    {modalPreview ? (
                      <img 
                        src={modalPreview.preview} 
                        alt="Preview" 
                        className="max-w-full max-h-[480px] object-contain"
                      />
                    ) : (
                      <button
                        onClick={openFileExplorer}
                        className="bg-[#0369A1] text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Browse
                      </button>
                    )}

                  </div>
                  <div className="bg-white border border-gray-300 rounded-lg shadow-inner p-4 h-[500px] flex items-center justify-center">
                  
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="bg-[#0369A1] text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-5 w-[120px]"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelClick}
                    className="bg-[#E2E8F0] text-black px-4 py-2 rounded-md hover:bg-blue-700 mr-7 w-[120px]"
                  >
                    Cancel
                  </button>
                </div>
                
              </div>
            </div>
          )}
        </div>

        <div className="text-[36px] font-bold mt-5 mb-2">
          Source File
        </div>

        <div className="bg-blue-50 rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#C1D9FF]">
                <th className="py-2 px-4 text-left">No.</th>
                <th className="py-2 px-4 text-left">File Name</th>
                <th className="py-2 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index} className="border-t border-blue-200">
                  <td className="py-2 px-4">{file.No}</td>
                  <td className="py-2 px-4">{file.fileName}</td>
                  <td className="py-2 px-4 text-right">
                    <button 
                      className="px-2 py-1 bg-gray-200 rounded-md mx-1 text-sm hover:bg-gray-300 font-bold"
                      onClick={() => handlePreview(file.preview!)}
                    >
                      PREVIEW
                    </button>
                    <button className="px-2 py-1 bg-gray-200 rounded-md mx-1 text-sm hover:bg-gray-300 font-bold">
                      EDIT
                    </button>
                    <button 
                      className="px-2 py-1 bg-gray-200 rounded-md mx-1 text-sm hover:bg-gray-300 font-bold"
                      onClick={() => handleDelete(index)}
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex justify-between">
          <div>
            Input Language Selection
            <LanguageDropdown />
          </div>

          <button
            className="text-white font-semibold px-4 py-1 rounded-lg bg-[#0369A1] hover:bg-[#9c9a9a] active:scale-95 transition transform duration-150 mr-0"
            onClick={handleStartProcess}
          >
            Start Process
          </button>  

          {isLoading && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center w-[400px]">
                <div className="flex flex-col items-center">
                  {/* Loading Text */}
                  <div className="text-xl font-bold mb-2">Processing, please wait...</div>
                  {/* Image Spinner */}
                  <Image
                    src="/images/spinner.gif"
                    alt=""
                    width={70}
                    height={70}
                    className="mb-4 animate-spin"
                  />
                </div>
                {/* Progress Bar */}
                <div className="relative w-full bg-gray-200 rounded-full h-4">
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

        <div className="text-[36px] font-bold mt-5 mb-2">
          Preview
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 min-h-[600px] flex items-center justify-center">
          {selectedPreview ? (
            <img 
              src={selectedPreview} 
              alt="Preview" 
              className="max-w-full max-h-[600px] object-contain"
            />
          ) : (
            <div className="text-gray-400">No image selected</div>
          )}
        </div>
      
      </div>
      
      <CustomAlert 
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        onConfirm={() => {
          handleCancelConfirm();
          setShowAlert(false);
        }}
      />

      <SuccessMessage isOpen={showSuccess} />


    </div>
  );
}