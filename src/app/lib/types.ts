export type ParamOcrRequest = {
  fileName: string;
  fileType: string;
  base64Data: string;
}

export type ParamSaveOcrRequest = {
  ocrId?: number;
  fileId?: number;
  fileName: string;
  fileType: string;
  base64Data: string;
  ocrResult: OcrResult [];
  userId: string 
}

export type ParamSaveTranslateRequest = {
  ocrId?: number;
  targetLanguage?: string;
  ocrResult: OcrResult [];
  userId: string 
}

export type SourceFileData = {
  id: number;
  ocrId?: number;
  fileId?: number;
  fileName: string;
  fileType: string;
  base64Data: string;
  targetLanguage?: string;
  ocrResult?: OcrResult [];
  blobUrl?: string;
}

export type OcrResult =  {
  page: number;
  base64Data: string;
  language?: string;
  extractedText?: string;
  translateText?: string;
  blobUrl?: string;
}


// export type TranslateResult = {
//   translatedText: string
// }