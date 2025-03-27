"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setImageUrl, resetImage } from "../store/slices/imageSlice";

export default function ImageCrop() {
  const dispatch = useAppDispatch();
  const imageUrl = useAppSelector((state) => state.image.imageUrl);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        dispatch(setImageUrl(reader.result as string));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      {imageUrl && <img src={imageUrl} alt="Preview" />}
      <button onClick={() => dispatch(resetImage())}>Reset</button>
    </div>
  );
}

