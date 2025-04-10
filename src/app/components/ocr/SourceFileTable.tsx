import React, { useState } from "react";
// import { useDispatch, useSelector } from 'react-redux';
import useToast from "../../hooks/useToast";
// import { setInputLanguage, setOutputLanguage, setFiles, addFile, removeFile, updateFile } from '../../store/slices/fileSlice';
// import { RootState } from '../../store/store';
import { SourceFileData, OcrResult } from "../../interface/file";
import { PhotoEditor } from '../photo-editor/PhotoEditor'
import ImageEditModal, { AdjustmentValues } from "./ImageEditModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
// import { useProcessContext } from '../../context/ProcessContext';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { removeFile } from '../../redux/actions';

interface SourceFileTableProps {
  fileData: SourceFileData[];
  onPreview: (file: SourceFileData) => void;
  onDelete: (index: number) => void;
  // onEdit: (file: SourceFileData) => void;
}

export default function SourceFileTable({
  fileData,
  onPreview,
  onDelete,
  // onEdit,
}: SourceFileTableProps) {
  // const { processData, setProcessData } = useProcessContext();
  const dispatch = useDispatch();
  const files = useSelector((state: RootState) => state.files.fileData);
  
  const { toastSuccess, toastError } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditImageModalOpen, setEditImageModalOpen] = useState(false);
 
  const [selectedFile, setSelectedFile] = useState<SourceFileData | undefined>(undefined);  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [fileToDeleteIndex, setFileToDeleteIndex] = useState<number | null>(null);

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);

  const translationsEn = {
    close: 'close',
    save: 'save',
    rotate: 'rotate',
    brightness: 'brightness',
    contrast: 'contrast',
    saturate: 'saturate',
    grayscale: 'grayscale',
    reset: 'reset',
    flipHorizontal: 'flip horizontally',
    flipVertical: 'flip vertically',
    zoomIn: 'zoom in',
    zoomOut: 'zoom out',
    crop: 'crop',
  };

  const handleRowClick = (index: number) => {
    setSelectedIndex(index === selectedIndex ? null : index);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handlers for Delete
  const handleDeleteFile = (index: number) => {
    setFileToDeleteIndex(index);
    setIsDeleteModalOpen(true);
  };
  const confirmDeleteFile = () => {
    if (fileToDeleteIndex !== null) {
      onDelete(fileToDeleteIndex);

      const deletedFile = fileData[fileToDeleteIndex];
      if (deletedFile && deletedFile?.name) {
        dispatch(removeFile(deletedFile.name));
        toastSuccess(`File ${deletedFile.name} deleted successfully`);
      }
    }

    setFileToDeleteIndex(null);
    setIsDeleteModalOpen(false);
  };

  // Handlers for ImageEditModal
  const handleOpenEditModal = (file: SourceFileData) => {
    setSelectedFile(file);
    setEditImageModalOpen(true);
  };

  const handleSaveEdit = (values: AdjustmentValues) => {
    // setAdjustedValues(values);
    toastSuccess(`Adjusted values saved for file: ${selectedFile?.name}`);
    setEditImageModalOpen(false);
  };

  const showEditModalHandler = (file: SourceFileData) => {
    setSelectedFile(file);

    fetchFileFromUrl(file)
    .then((file) => {
      console.log(file);
      setFile(file);
      setShowEditModal(true);
    })
    .catch((error) => {
      console.error(error);
    });
  };

  const hideEditModal = () => {
    setShowEditModal(false);
  };

  const handleSaveImage = (editedFile: File) => {
    // setFile(editedFile);
    // URL.revokeObjectURL(url);
  };

  async function fetchFileFromUrl(fileData: SourceFileData): Promise<File> {
    const response = await fetch(fileData.url);
    const blob = await response.blob();
  
    const fileName = fileData.name || "";
    const fileType = fileData.type;
  
    const file = new File([blob], fileName, { type: fileType });
    return file;
  }

  const PhotoEditorComponent = showEditModal ? (
    <PhotoEditor
      open={showEditModal}
      onClose={hideEditModal}
      file={file}
      allowColorEditing={true}
      allowFlip={true}
      allowRotate={true}
      allowZoom={true}
      allowCrop={true}
      onSaveImage={handleSaveImage}
      downloadOnSave={true}
      labels={translationsEn} // ใส่การแปล
    />
  ) : null;
  
  const ImageEditModalComponent = isEditImageModalOpen ? (
    <ImageEditModal
      isOpen={isEditImageModalOpen}
      onClose={() => setEditImageModalOpen(false)}
      imageSrc={selectedFile ? selectedFile.url : ""}
      onSave={handleSaveEdit}
    />
  ) : null;

  return (
    <>
      <div className="max-h-[79vh] border border-gray-300 rounded-lg shadow-sm overflow-y-auto overflow-x-hidden">
        <table className="table-auto w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr className="bg-blue-200 text-left text-sm font-medium">
              <th className="px-4 py-3 !text-black">No.</th>
              <th className="px-4 py-3 !text-black">File Name</th>
              <th className="px-4 py-3 !text-black text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fileData?.map((item, index) => (
              <tr
                key={index}
                className={`border-t transition ease-in-out duration-150 ${
                  selectedIndex === index ? "bg-gray-200" : index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
                onClick={() => handleRowClick(index)}
              >
                <td className="px-4 py-2 text-sm text-gray-600">{index + 1}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{item.name}</td>
                <td className="px-4 py-2 flex items-center justify-center space-x-2">
                  {/* Preview Button */}
                  <button
                    className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600 transition"
                    onClick={(e) => {
                      handleButtonClick(e);
                      setSelectedIndex(index);
                      onPreview(item);
                    }}
                  >
                    Preview
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={(e) => {
                      handleButtonClick(e);
                      handleOpenEditModal(item);
                    }}
                    className={`px-3 py-1 text-sm rounded transition ${
                      item.type === "application/pdf"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    disabled={item.type === "application/pdf"}
                  >
                    Edit 
                  </button>

                  <button 
                    onClick={(e) => {
                      handleButtonClick(e);
                      showEditModalHandler(item)
                    }}
                    className={`px-3 py-1 text-sm rounded transition ${
                      item.type === "application/pdf"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    disabled={item.type === "application/pdf"}
                  >
                    Edit
                    </button>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      handleButtonClick(e);
                      handleDeleteFile(index);
                    }}
                    className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ImageEditModalComponent}

      {PhotoEditorComponent}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete File"
        message={`Are you sure you want to delete this file ${fileToDeleteIndex !== null ? fileData[fileToDeleteIndex]?.name : ""}?`}
        actions={[
          { label: "NO", onClick: () => setIsDeleteModalOpen(false) },
          { label: "YES", onClick: confirmDeleteFile },
        ]}
      />
    </>
  );
}
