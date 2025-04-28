
export interface OcrRequest {
  fileName: string;
  fileType: string;
  base64Data: string;
}

export interface TranslateRequest {
  id: number;
}

export interface SourceFileData {
  id?: number;
  // fileId?: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  base64Data: string;
  blobUrl?: string;
  outputLanguage?: string;
  ocrResult?: OcrResult [];
}

export interface OcrResult  {
  page: number;
  base64Image: string;
  blobUrl?: string;
  extractedText?: string;
  translateText?: string;
}

export interface OcrTextResult {
  primary_language: string;
  natural_text: string;
}

