"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { ChartBarIcon, LanguagesIcon, HistoryIcon, FileTextIcon, Settings2Icon } from 'lucide-react';
import CloseBTN from "../components/CloseBTN";
import LanguageDropdown from "../components/LanguageDropdown";
import CustomAlert from '../components/CustomAlert';
import SuccessMessage from '../components/SuccessMessage';

interface FileData {
  No: number;
  fileName: string;
  preview?: string;
}

export default function ReadingPage() {
  const [isAddNewCameraBTNOpen, setAddNewCameraBTNOpen] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalPreview, setModalPreview] = useState<FileData | null>(null);
  const router = useRouter();

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
      setAddNewCameraBTNOpen(false);
      
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
    setAddNewCameraBTNOpen(false);
    
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

  return (
    <div className="w- text-black grid grid-cols-2 gap-10 p-10">
      <div>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          // multiple
          accept="image/*"
        />
        
        <div>
          <button
            className="text-white font-semibold px-4 py-1 rounded-lg bg-[#0369A1] hover:bg-[#9c9a9a] active:scale-95 transition transform duration-150 mr-8"
            onClick={() => {setAddNewCameraBTNOpen(true)}}
          >
            Add +
          </button>

          {isAddNewCameraBTNOpen && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white shadow-lg max-w-[850px] min-h-[650px] w-full">

                <div className="flex justify-between bg-[#64748B] h-[42px]">
                  <div className="text-white font-bold content-center ms-2">
                    MAPPING WITH TEMPLATES
                  </div>
                  <div className="content-center mr-1">
                    <CloseBTN onClick={() => setAddNewCameraBTNOpen(false)} />
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
            onClick={() => {setAddNewCameraBTNOpen(true)}}
          >
            Start Process
          </button>  
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