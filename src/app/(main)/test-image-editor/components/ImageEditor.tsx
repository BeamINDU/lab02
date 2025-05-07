import { useState } from 'react'
import { PhotoEditor } from '@/app/components/photo-editor/PhotoEditor'

export default function ImageEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const showModalHandler = () => {
    if (file) {
      setShowModal(true);
    }
  };

  const hideModal = () => {
    setShowModal(false);
  };

  const handleSaveImage = (editedFile: File) => {
    setFile(editedFile);
  };

  const setFileData = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);
      } else {
        alert("Please select a valid image file.");
      }
    }
  };

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

  return (
    <div>
      <input type="file" onChange={(e) => setFileData(e)} multiple={false} />
      <button className='bg-gray-200 p-2 rounded-md ml-2' onClick={showModalHandler}>Edit</button>

      {file && (
        <PhotoEditor
          open={showModal}
          onClose={hideModal}
          file={file}
          allowColorEditing={true}
          allowFlip={true}
          allowRotate={true}
          allowZoom={true}
          allowCrop={true}
          onSaveImage={handleSaveImage}
          downloadOnSave={true}
          labels={translationsEn} // Apply translations
        />
      )}
    </div>
  );
}
