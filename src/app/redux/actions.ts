// redux/actions.ts
import { SourceFileData, OcrResult } from "../interface/file"
export const ADD_FILES = 'ADD_FILES';
export const REMOVE_FILE = 'REMOVE_FILE';
export const UPDATE_FILE = 'UPDATE_FILE';
export const CLEAR_FILES = 'CLEAR_FILES';
// export const ADD_OCR_RESULT = "ADD_OCR_RESULT";
// export const DELETE_OCR_RESULT = 'DELETE_OCR_RESULT';
// export const CLEAR_OCR_RESULT = 'CLEAR_OCR_RESULT';

// Action creators
export const addFiles = (files: SourceFileData[]) => ({
  type: ADD_FILES,
  payload: files,
});

export const removeFile = (fileName: string) => ({
  type: REMOVE_FILE,
  payload: fileName,
});

export const updateFile = (updatedFile: SourceFileData) => ({
  type: UPDATE_FILE,
  payload: updatedFile,
});

export const clearFiles = () => ({
  type: CLEAR_FILES
});