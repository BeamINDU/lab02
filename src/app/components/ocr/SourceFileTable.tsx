import React, { useState } from "react";
import { Eye, Pencil, Trash2 } from 'lucide-react';
import useToast from "@/app/hooks/useToast";
import { useDispatch, useSelector } from 'react-redux';
// import { selectAllSourceFiles } from '@/app/store/file/fileSelectors';
import { updateFile, removeFile } from '@/app/store/file/fileActions';
import { readFileAsBase64, convertBase64ToBlobUrl, convertBlobToFile } from '@/app/lib/utils/file';
import { SourceFileData } from "@/app/lib/interfaces";
import ConfirmModal from "@/app/components/modal/ConfirmModal";
import { PhotoEditor } from '@/app/components/photo-editor/PhotoEditor'

interface SourceFileTableProps {
  sourceFiles: SourceFileData[];
  onPreview: (file: SourceFileData) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  loading : boolean;
}

export default function SourceFileTable({
  sourceFiles,
  onPreview,
  onEdit,
  onDelete,
  loading ,
}: SourceFileTableProps) {
  const { toastSuccess, toastError } = useToast();

  const dispatch = useDispatch();
  // const initialFiles = useSelector(selectAllSourceFiles);
  // const [sourceFiles, setSourceFiles] = useState<SourceFileData[]>([]);

  const [selectedFile, setSelectedFile] = useState<SourceFileData | undefined>(undefined);  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [fileToDeleteIndex, setFileToDeleteIndex] = useState<number | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const [file, setFile] = useState<File | null>(null);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleRowClick = (index: number) => {
    setSelectedIndex(index === selectedIndex ? null : index);
  };

  const handleShowDeleteModal = (index: number) => {
    setFileToDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleDeleteFile = () => {
    if (fileToDeleteIndex !== null) {
      const deletedFile = sourceFiles[fileToDeleteIndex];
      if (deletedFile && deletedFile?.id) {
        dispatch(removeFile(deletedFile.id));
        onDelete(deletedFile.id);
        toastSuccess(`File ${deletedFile.id} deleted successfully`);
      }
    }

    setFileToDeleteIndex(null);
    setShowDeleteModal(false);
  };
  
  const handleSaveImage = async (editedFile: File) => {
    setFile(editedFile);

    const base64Data = await readFileAsBase64(editedFile);
    const id = selectedFile?.id;
  
    const fileToUpdate = sourceFiles.find(file => file.id === id);
  
    if (!fileToUpdate) return;
  
    const updatedFile = {
      ...fileToUpdate,
      base64Data: base64Data,
      blobUrl: base64Data ? convertBase64ToBlobUrl(base64Data) : '',
    };
    dispatch(updateFile(updatedFile));

    onEdit(id ?? 0);
  };

  const handleShowEditModal = (file: SourceFileData) => {
    setSelectedFile(file);

    convertBlobToFile(file.blobUrl ?? "", file.fileName, file.fileType)
      .then((file) => {
        // console.log(file);
        setFile(file);
        setShowEditModal(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleHideEditModal = () => {
    setShowEditModal(false);
  };

  const PhotoEditorComponent = showEditModal ? (
    <PhotoEditor
      open={showEditModal}
      onClose={handleHideEditModal}
      file={file}
      allowColorEditing={true}
      allowFlip={true}
      allowRotate={true}
      allowZoom={true}
      allowCrop={true}
      onSaveImage={handleSaveImage}
      downloadOnSave={false}
      labels={{
        close: 'Close',
        save: 'Save',
        rotate: 'Rotate',
        brightness: 'Brightness',
        contrast: 'Contrast',
        saturate: 'Saturate',
        grayscale: 'Grayscale',
        reset: 'Reset photo',
        flipHorizontal: 'Flip photo horizontally',
        flipVertical: 'Flip photo vertically',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        crop: 'Crop',
      }}
    />
  ) : null;

  const ConfirmModalComponent = (
    <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete File"
        message={`Are you sure you want to delete this file ${fileToDeleteIndex !== null ? sourceFiles[fileToDeleteIndex]?.fileName : ""}?`}
        actions={[
          { label: "NO", onClick: () => setShowDeleteModal(false) },
          { label: "YES", onClick: handleDeleteFile },
        ]}
      />
  );

  return (
    <>
      <div className="border border-gray-300 rounded-lg shadow-sm overflow-y-auto overflow-x-hidden">
        <table className="table-auto w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr className="bg-blue-200 text-left text-sm font-medium">
              <th className="px-4 py-3 !text-black w-12">No.</th>
              <th className="px-4 py-3 !text-black">File Name</th>
              <th className="px-4 py-3 !text-black text-center w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
          {loading ? (
            <tr>
              <td colSpan={3} className="px-4 py-3 text-sm text-gray-500 text-center">Loading...</td>
            </tr>
          ) : (
            sourceFiles?.map((item, index) => (
              <tr
                key={item.id}
                className={`border-t transition ease-in-out duration-150 ${
                  selectedIndex === index ? "bg-gray-200" : index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
                onClick={() => handleRowClick(index)}
              >
                <td className="px-4 py-2 text-sm text-gray-600 text-center">{index + 1}</td>

                <td className="px-4 py-2 text-sm text-gray-600" style={{ width: '80%' }}>
                  {item.fileName}
                </td>

                {/* Actions */}
                <td className="px-4 py-2">
                  <div className="flex justify-end items-center space-x-2">
                    {/* Preview */}
                    <button
                      className="p-2 bg-green-500 rounded-full hover:bg-green-600 transition text-white"
                      onClick={(e) => {
                        handleButtonClick(e);
                        setSelectedIndex(index);
                        onPreview(item);
                      }}
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={(e) => {
                        handleButtonClick(e);
                        handleShowEditModal(item)
                      }}
                      className={`p-2 rounded-full transition ${
                        (item.fileType === "application/pdf" || (item.ocrResult && item.ocrResult.length > 0))
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                      disabled={item.fileType === "application/pdf" || (item.ocrResult && item.ocrResult.length > 0)}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        handleButtonClick(e);
                        handleShowDeleteModal(index);
                      }}
                      className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition text-white"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

      {PhotoEditorComponent}

      {ConfirmModalComponent}

    </>
  );
}
