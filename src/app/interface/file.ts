// export interface OcrResult {
//   file: SourceFileData;
//   pageOcrResult?: PageOcrResult [];
// }

export interface SourceFileData {
  id: number;
  name: string;
  type: string;
  size: number;
  base64Data: string;
  blobUrl: string;
  ocrResult?: OcrResult [];
}

export interface OcrResult  {
  page: number;
  extractedText?: string;
  base64Image: string;
  blobUrl: string;
}
