import { useEffect, ChangeEvent } from 'react';
import { RotateCcw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, Crop } from 'lucide-react';
import { PhotoEditorProps } from './interface';
import { usePhotoEditor } from '@/app/hooks/usePhotoEditor';

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  file,
  onSaveImage,
  allowColorEditing = true,
  allowFlip = true,
  allowRotate = true,
  allowZoom = true,
  allowCrop = true,
  downloadOnSave,
  open,
  onClose,
  modalHeight,
  modalWidth,
  canvasHeight,
  canvasWidth,
  labels = {
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
  }
}) => {
  const {
    canvasRef,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    saturate,
    setSaturate,
    grayscale,
    setGrayscale,
    rotate,
    setRotate,
    flipHorizontal,
    setFlipHorizontal,
    flipVertical,
    setFlipVertical,
    isDragging,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    handleWheel,
    handleZoomIn,
    handleZoomOut,
    handleCrop,
    resetFilters,
    downloadImage,
    generateEditedFile,
    applyFilter
  } = usePhotoEditor({ file });

  if (!file) return null;

  /* eslint-disable react-hooks/rules-of-hooks */
  useEffect(() => {
    if (open) {
      resetFilters();
      applyFilter();
    }
  }, [open]);
  /* eslint-enable react-hooks/rules-of-hooks */

 const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    setValue: React.Dispatch<React.SetStateAction<number>>,
    min: number,
    max: number
  ) => {
    const value = parseInt(event.target?.value);
    if (!isNaN(value) && value >= min && value <= max) {
      setValue(value);
    }
  };

  const renderInputs = [
    { name: labels.rotate, value: rotate, setValue: setRotate, min: -180, max: 180, type: 'range', hide: !allowRotate },
    { name: labels.brightness, value: brightness, setValue: setBrightness, min: 0, max: 200, type: 'range', hide: !allowColorEditing },
    { name: labels.contrast, value: contrast, setValue: setContrast, min: 0, max: 200, type: 'range', hide: !allowColorEditing },
    { name: labels.saturate, value: saturate, setValue: setSaturate, min: 0, max: 200, type: 'range', hide: !allowColorEditing },
    { name: labels.grayscale, value: grayscale, setValue: setGrayscale, min: 0, max: 100, type: 'range', hide: !allowColorEditing },
  ];

  const closeEditor = () => {
    resetFilters();
    onClose?.();
  };

  const saveImage = async () => {
    if (downloadOnSave) {
      downloadImage();
    }
    const editedFile = await generateEditedFile();
    if (editedFile) {
      onSaveImage(editedFile);
    }
    onClose?.();
  };

  return (
    <>
      {open && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-75 z-40" />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-7xl max-h-[90vh] overflow-hidden"
              style={{ width: modalWidth ?? '90vw', height: modalHeight ?? '90vh' }}
            >
              {/* Header */}
              <div className="flex justify-end gap-2 mt-2 mr-4">
                <button title={labels.close} onClick={closeEditor} className="text-xl text-gray-500 hover:text-gray-800">
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Canvas */}
                <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-hidden">
                  <canvas
                    id="canvas"
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onWheel={handleWheel}
                    width={typeof canvasWidth === 'number' ? canvasWidth : undefined}
                    height={typeof canvasHeight === 'number' ? canvasHeight : undefined}
                    className={`max-w-full max-h-full object-contain ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  />
                </div>

                {/* Reset / Flip / Zoom */}
                <div className="flex items-center justify-center gap-2 px-4 mt-2">
                  <button title={labels.reset} onClick={resetFilters} className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <RotateCcw className="w-6 h-6 text-gray-700" />
                  </button>

                  {/* {allowCrop && (
                    <button title={labels.crop} onClick={handleCrop} className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
                      <Crop className="w-6 h-6 text-gray-700" />
                    </button>
                  )} */}

                  {allowFlip && (
                    <>
                      <button title={labels.flipHorizontal} onClick={() => setFlipHorizontal(!flipHorizontal)} className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <FlipHorizontal className="w-6 h-6 text-gray-700" />
                      </button>
                      <button title={labels.flipVertical} onClick={() => setFlipVertical(!flipVertical)} className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <FlipVertical className="w-6 h-6 text-gray-700" />
                      </button>
                    </>
                  )}

                  {allowZoom && (
                    <>
                      <button title={labels.zoomIn} onClick={handleZoomIn} className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <ZoomIn className="w-6 h-6 text-gray-700" />
                      </button>
                      <button title={labels.zoomOut} onClick={handleZoomOut} className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <ZoomOut className="w-6 h-6 text-gray-700" />
                      </button>
                    </>
                  )}
                </div>

                {/* Sliders */}
                <div className="px-4 space-y-1 overflow-y-auto ">
                  {renderInputs.map((input) =>
                    !input.hide ? (
                      <div key={input.name} className="flex items-center gap-2">
                        <label className="text-xs font-medium w-24 truncate">{input.name}:</label>
                        <input
                          type="range"
                          value={input.value}
                          onChange={(e) => handleInputChange(e, input.setValue, input.min, input.max)}
                          min={input.min}
                          max={input.max}
                          className="flex-1 h-1 accent-blue-500 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <input
                          type="number"
                          value={input.value}
                          onChange={(e) => handleInputChange(e, input.setValue, input.min, input.max)}
                          min={input.min}
                          max={input.max}
                          className="w-14 rounded-md border border-gray-300 text-right px-2 py-1 text-xs"
                        />
                      </div>
                    ) : null
                  )}
                </div>

                {/* Footer: Cancel / Save */}
                <div className="flex justify-center gap-4 mb-4 mt-2">
                  <button
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm font-semibold w-24"
                    onClick={closeEditor}
                  >
                    {labels.close}
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold w-24"
                    onClick={saveImage}
                  >
                    {labels.save}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
