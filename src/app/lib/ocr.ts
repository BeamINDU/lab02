import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { convertToBase64, convertBase64ToBlobUrl } from '../utils/file';
import { SourceFileData, OcrResult } from '../interface/file';
import Tesseract from 'tesseract.js';

export const readTextFromFile = async (
  worker: Tesseract.Worker,
  selectedFile: SourceFileData,
  setProgress: (progress: number) => void
): Promise<SourceFileData> => {
  if (!worker) throw new Error("Tesseract worker is not initialized");

  if (selectedFile.type?.startsWith("image/")) {
    const { data: { text } } = await worker.recognize(selectedFile.blobUrl);

    return {
      ...selectedFile,
      ocrResult: [{
        page: 1,
        extractedText: text,
        base64Image: selectedFile.base64Data,
        blobUrl: selectedFile.blobUrl
      }]
    };
  } else {
    const pdf = await getDocument(selectedFile.blobUrl).promise;
    const numPages = pdf.numPages;
    const ocrResult: OcrResult[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: 1 });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;

        const base64Image = canvas.toDataURL(selectedFile.type, 0.5);
        const blobUrl = convertBase64ToBlobUrl(base64Image);

        const { data: { text } } = await worker.recognize(base64Image);

        ocrResult.push({
          page: pageNum,
          extractedText: text,
          base64Image,
          blobUrl
        });

        setProgress(pageNum / numPages);
      } else {
        throw new Error("Failed to get canvas context.");
      }
    }

    return {
      ...selectedFile,
      ocrResult: ocrResult
    };
  }
};
