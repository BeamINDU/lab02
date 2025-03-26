import React, { useState } from "react";
import { FaSearchPlus, FaSearchMinus, FaCrop, FaArrowsAltH, FaArrowsAltV } from "react-icons/fa";
import { LuFlipVertical, LuFlipHorizontal } from "react-icons/lu";

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onSave: (values: AdjustmentValues) => void;
}

export interface AdjustmentValues {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sharpness: number;
  noiseReduction: number;
  rotation: number;
  zoom: number;
  cropX: number;
  cropY: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onSave,
}) => {
  const defaultAdjustments = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sharpness: 0,
    noiseReduction: 0,
    rotation: 0,
    zoom: 100,
    cropX: 0,
    cropY: 0,
    flipHorizontal: false,
    flipVertical: false,
  };

  const defaultDragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    translateX: 0,
    translateY: 0,
  };

  const [adjustments, setAdjustments] = useState<AdjustmentValues>(defaultAdjustments);

  const [dragState, setDragState] = useState(defaultDragState);

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    setDragState((prev) => ({
      ...prev,
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
    }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!dragState.isDragging) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;

    setDragState((prev) => ({
      ...prev,
      translateX: prev.translateX + deltaX,
      translateY: prev.translateY + deltaY,
      startX: e.clientX,
      startY: e.clientY,
    }));
  };

  const handleMouseUp = () => {
    setDragState((prev) => ({
      ...prev,
      isDragging: false,
    }));
  };

  const handleSliderChange = (field: keyof AdjustmentValues, value: number) => {
    setAdjustments((prev) => ({ ...prev, [field]: value }));
  };

  const handleZoomIn = () => {
    setAdjustments((prev) => ({ ...prev, zoom: Math.min(prev.zoom + 10, 300) })); // Cap zoom at 300%
  };

  const handleZoomOut = () => {
    setAdjustments((prev) => ({ ...prev, zoom: Math.max(prev.zoom - 10, 50) })); // Minimum zoom 50%
  };

  const handleFlipHorizontal = () => {
    setAdjustments(prev => ({ ...prev, flipHorizontal: !prev.flipHorizontal }));
  };

  const handleFlipVertical = () => {
    setAdjustments(prev => ({ ...prev, flipVertical: !prev.flipVertical }));
  };

  const handleCrop = () => {
    setAdjustments((prev) => ({
      ...prev,
      cropX: Math.min(prev.cropX + 10, 100),
      cropY: Math.min(prev.cropY + 10, 100),
    }));
  };

  const handleReset = () => {
    setAdjustments(defaultAdjustments);
    setDragState(defaultDragState);
  };

  const handleCancel = () => {
    setAdjustments(defaultAdjustments);
    setDragState(defaultDragState);
    onClose();
  };

  const handleSave = () => {
    onSave(adjustments);
    onClose();
  };

  if (!isOpen) return null;

  const imageStyle: React.CSSProperties = {
    filter: `
            brightness(${adjustments.brightness}%)
            contrast(${adjustments.contrast}%)
            saturate(${adjustments.saturation}%)
            grayscale(${adjustments.grayscale}%)
        `,
    transform: `
            rotate(${adjustments.rotation}deg)
            scale(${adjustments.zoom / 100})
            scaleX(${adjustments.flipHorizontal ? -1 : 1})
            scaleY(${adjustments.flipVertical ? -1 : 1})
            translate(${dragState.translateX}px, ${dragState.translateY}px)
        `,
    clipPath: `inset(${adjustments.cropY}px ${adjustments.cropX}px)`, // ใช้ clip-path เพื่อครอปภาพ
    transformOrigin: 'center',
    cursor: dragState.isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-6xl shadow-lg flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-black text-xl font-semibold">Edit Image</h2>
          <button onClick={onClose} className="text-xl text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>
        <hr className="my-4" />

        {/* Image Display and Sliders */}
        <div className="flex-grow flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
          {/* Image Display */}
          <div
            className="w-full md:w-2/3 overflow-hidden flex justify-center items-center border border-gray-300"
            style={{ height: '570px', position: 'relative' }}
          >
            <img
              src={imageSrc}
              alt="Editable"
              style={{
                ...imageStyle,
                objectFit: 'contain',
                width: '100%',
                height: '100%',
              }}
              className="w-full h-full object-cover"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            // onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Sliders */}
          <div className="w-full md:w-1/3 space-y-4">
            {Object.entries(adjustments).map(([key, value]) => {
              if (key === 'zoom' || key === 'cropX' || key === 'cropY' || key === 'flipHorizontal' || key === 'flipVertical') return null;
              return (
                <div key={key} className="flex flex-col items-start space-y-2">
                  <label className="text-sm font-semibold capitalize mb-0">{key}</label>
                  <div className="flex items-center w-full">
                    <input
                      type="range"
                      min={key === "rotation" ? -180 : 0}
                      max={key === "rotation" ? 180 : key === "sharpness" || key === "noiseReduction" ? 100 : 200}
                      value={value}
                      onChange={(e) =>
                        handleSliderChange(key as keyof AdjustmentValues, Number(e.target.value))
                      }
                      className="w-full"
                    />
                    <input
                      type="number"
                      value={value}
                      readOnly
                      className="w-12 text-center border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Image Style & Actions */}
        <div className="flex-grow flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 mt-8">
          {/* Image Style */}
          <div className="w-full flex items-center justify-center">
            <div className="flex gap-4">
              <button onClick={handleCrop} className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600">
                <FaCrop />
              </button>
              <button onClick={handleZoomIn} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
                <FaSearchPlus />
              </button>
              <button onClick={handleZoomOut} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
                <FaSearchMinus />
              </button>
              <button onClick={handleFlipHorizontal} className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600">
                <LuFlipHorizontal />
              </button>
              <button onClick={handleFlipVertical} className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600">
                <LuFlipVertical />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full md:w-1/3 space-y-4 space-x-4">
            <button onClick={handleReset} className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600">
              Reset
            </button>
            <button onClick={handleSave} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
              Save & Exit
            </button>
            <button onClick={handleCancel} className="bg-gray-300 text-black p-2 rounded-md hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImageEditModal;
