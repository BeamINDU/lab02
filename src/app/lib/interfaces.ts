
export interface SourceFileData {
  id: number;
  ocrId?: number;
  fileId?: number;
  fileName: string;
  fileType: string;
  base64Data: string;
  ocrResult?: OcrResult [];
  targetLanguage?: string;
  transId?: number;
  blobUrl?: string;
}

export interface OcrResult {
  page: number;
  base64Data: string;
  language?: string;
  extractedText?: string;
  translateText?: string;
  blobUrl?: string;
}


export interface ParamOcrRequest {
  fileName: string;
  fileType: string;
  base64Data: string;
}

export interface ParamSaveOcrRequest {
  ocrId?: number;
  fileId?: number;
  fileName: string;
  fileType: string;
  base64Data: string;
  ocrResult: OcrResult [];
  userId: string 
}

export interface ParamSaveTranslateRequest extends SourceFileData {
  userId: string 
}

// export interface ParamSaveTranslateRequest {
//   ocrId?: number;
//   fileId?: number;
//   fileName: string;
//   fileType: string;
//   base64Data: string;
//   ocrResult?: OcrResult [];
//   blobUrl?: string;
//   targetLanguage?: string;
//   transId?: number;
//   userId: string 
// }
