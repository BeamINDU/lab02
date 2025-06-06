
import React, { useState, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { canvasPreview } from "./canvasPreview";
import { useDebounceEffect } from "@/app/hooks/useDebounceEffect"; 

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      { unit: "%", width: 90 },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCrop() {
  const [imgSrc, setImgSrc] = useState<string>("");
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener("load", () => setImgSrc(reader.result?.toString() || ""));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  useDebounceEffect(() => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
      canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate);
    }
  }, 100, [completedCrop, scale, rotate]);

  return (
    <div className="p-4">
      <input type="file" accept="image/*" onChange={onSelectFile} />
      
      {!!imgSrc && (
        <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect}>
          <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} className="mt-4 max-w-full" alt="" />
        </ReactCrop>
      )}

      {!!completedCrop && (
        <canvas ref={previewCanvasRef} className="border mt-4" />
      )}
    </div>
  );
}

