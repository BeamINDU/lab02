import { PixelCrop } from "react-image-crop";

export function canvasPreview(image: HTMLImageElement, canvas: HTMLCanvasElement, crop: PixelCrop, scale = 1, rotate = 0) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not found");

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.save();
  ctx.translate(-crop.x * scaleX, -crop.y * scaleY);
  ctx.drawImage(image, 0, 0);
  ctx.restore();
}
