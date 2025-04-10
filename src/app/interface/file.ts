// export interface OcrResult {
//   file: SourceFileData;
//   pageOcrResult?: PageOcrResult [];
// }

export interface SourceFileData {
  id: number;
  name: string;
  type: string;
  size: number;
  rawFile: File;
  url: string;
  base64: string;
  ocrResult?: OcrResult [];
}

export interface OcrResult  {
  page: number;
  extractedText?: string;
  base64Image: string;
  blobUrl: string;
}
