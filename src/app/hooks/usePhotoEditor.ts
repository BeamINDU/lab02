import { useState, useEffect, useRef } from 'react';
import Cropper, { Crop, PixelCrop } from "react-image-crop";

/**
 * Parameters for the usePhotoEditor hook.
 */
interface UsePhotoEditorParams {
  file?: File | null;
  defaultBrightness?: number;
  defaultContrast?: number;
  defaultSaturate?: number;
  defaultGrayscale?: number;
  defaultFlipHorizontal?: boolean;
  defaultFlipVertical?: boolean;
  defaultZoom?: number;
  defaultRotate?: number;
  defaultCrop?: Crop;
}

export const usePhotoEditor = ({
  file,
  defaultBrightness = 100,
  defaultContrast = 100,
  defaultSaturate = 100,
  defaultGrayscale = 0,
  defaultFlipHorizontal = false,
  defaultFlipVertical = false,
  defaultZoom = 1,
  defaultRotate = 0,
  defaultCrop = {
    unit: "%",
    width: 50,
    height: 50,
    x: 10,
    y: 10,
  },
}: UsePhotoEditorParams) => {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef(new Image());
  const [imageSrc, setImageSrc] = useState<string>('');
  const [brightness, setBrightness] = useState(defaultBrightness);
  const [contrast, setContrast] = useState(defaultContrast);
  const [saturate, setSaturate] = useState(defaultSaturate);
  const [grayscale, setGrayscale] = useState(defaultGrayscale);
  const [rotate, setRotate] = useState(defaultRotate);
  const [flipHorizontal, setFlipHorizontal] = useState(defaultFlipHorizontal);
  const [flipVertical, setFlipVertical] = useState(defaultFlipVertical);
  const [zoom, setZoom] = useState(defaultZoom);
  const [crop, setCrop] = useState(defaultCrop);
  const [isDragging, setIsDragging] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  // const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  useEffect(() => {
    if (file) {
      const fileSrc = URL.createObjectURL(file);
      setImageSrc(fileSrc);
      return () => {
        URL.revokeObjectURL(fileSrc);
      };
    }
  }, [file]);

  useEffect(() => {
    applyFilter();
  }, [file, imageSrc, rotate, flipHorizontal, flipVertical, zoom, crop, brightness, contrast, saturate, grayscale, offsetX, offsetY]);

  const applyFilter = () => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const imgElement = imgRef.current;
    imgElement.src = imageSrc;

    imgElement.onload = () => {
      if (canvas && context) {
        const zoomedWidth = imgElement.width * zoom;
        const zoomedHeight = imgElement.height * zoom;
        const translateX = (imgElement.width - zoomedWidth) / 2;
        const translateY = (imgElement.height - zoomedHeight) / 2;

        canvas.width = imgElement.width;
        canvas.height = imgElement.height;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.filter = getFilterString();
        context.save();

        if (rotate) {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          context.translate(centerX, centerY);
          context.rotate((rotate * Math.PI) / 180);
          context.translate(-centerX, -centerY);
        }
        if (flipHorizontal) {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        if (flipVertical) {
          context.translate(0, canvas.height);
          context.scale(1, -1);
        }

        context.translate(translateX + offsetX, translateY + offsetY);
        context.scale(zoom, zoom);
        context.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

        context.restore();
      }
    };
  };

  const generateEditedFile = (): Promise<File | null> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas || !file) {
        resolve(null);
        return;
      }

      const fileExtension = (file.name.split('.').pop() || '').toLowerCase();
      let mimeType;
      switch (fileExtension) {
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        default:
          mimeType = 'image/png';
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], file.name, { type: blob.type });
          resolve(newFile);
        } else {
          resolve(null);
        }
      }, mimeType);
    });
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas && file) {
      const link = document.createElement('a');
      link.download = file.name;
      link.href = canvas.toDataURL(file?.type);
      link.click();
    }
  };

  const getFilterString = (): string => {
    return `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) saturate(${saturate}%)`;
  };

  const handleZoomIn = () => {
    setZoom((prevZoom) => prevZoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.1));
  };

  const handleCrop = () => {

  }

  const handlePointerDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    const initialX = event.clientX - offsetX;
    const initialY = event.clientY - offsetY;
    setPanStart({ x: initialX, y: initialY });
  };

  const handlePointerMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && panStart) {
      event.preventDefault();
      const offsetXDelta = event.clientX - panStart.x;
      const offsetYDelta = event.clientY - panStart.y;

      setOffsetX(offsetXDelta);
      setOffsetY(offsetYDelta);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (event.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const resetFilters = () => {
    setBrightness(defaultBrightness);
    setContrast(defaultContrast);
    setSaturate(defaultSaturate);
    setGrayscale(defaultGrayscale);
    setRotate(defaultRotate);
    setFlipHorizontal(defaultFlipHorizontal);
    setFlipVertical(defaultFlipVertical);
    setZoom(defaultZoom);
    setCrop(defaultCrop);
    setOffsetX(0);
    setOffsetY(0);
    setPanStart(null);
    setIsDragging(false);
  };

  return {
    canvasRef,
    imageSrc,
    brightness,
    contrast,
    saturate,
    grayscale,
    rotate,
    flipHorizontal,
    flipVertical,
    zoom,
    isDragging,
    panStart,
    offsetX,
    offsetY,
    setBrightness,
    setContrast,
    setSaturate,
    setGrayscale,
    setRotate,
    setFlipHorizontal,
    setFlipVertical,
    setZoom,
    setCrop,
    setIsDragging,
    setPanStart,
    setOffsetX,
    setOffsetY,
    handleZoomIn,
    handleZoomOut,
    handleCrop,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    handleWheel,
    downloadImage,
    generateEditedFile,
    resetFilters,
    applyFilter,
  };
};
