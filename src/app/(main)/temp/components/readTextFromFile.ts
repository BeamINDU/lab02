import { convertBase64ToBlobUrl } from '@/app/lib/utils/file';
import { SourceFileData, OcrResult } from '@/app/lib/interfaces';
import { getDocument } from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

export const readTextFromFile = async (
  worker: Tesseract.Worker,
  selectedFile: SourceFileData,
  setProgress: (progress: number) => void
): Promise<SourceFileData> => {
  
  if (!worker) throw new Error("Tesseract worker is not initialized");

  const sourceLang = "eng";

  if (selectedFile.fileType?.startsWith("image/")) {

    const { data: { text } } = await worker.recognize(selectedFile.blobUrl ?? "");

    const extractedTextString = JSON.stringify({
      primary_language: sourceLang,
      natural_text: `${text}`
    });

    return {
      ...selectedFile,
      ocrResult: [{
        page: 1,
        extractedText: extractedTextString,
        base64Data: selectedFile.base64Data,
        blobUrl: selectedFile.blobUrl
      }]
    };
  } else {
    
    const pdf = await getDocument(selectedFile.blobUrl ?? "").promise;
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

        const base64Data = canvas.toDataURL(selectedFile.fileType, 0.5);
        const blobUrl = convertBase64ToBlobUrl(base64Data);

        const { data: { text } } = await worker.recognize(base64Data);

        const extractedTextString = JSON.stringify({
          primary_language: sourceLang,
          is_rotation_valid: true,
          rotation_correction: 0,
          is_table: false,
          is_diagram: false,
          natural_text: `${text}`
        });

        ocrResult.push({
          page: pageNum,
          extractedText: extractedTextString,
          base64Data,
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
