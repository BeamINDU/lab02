// redux/actions.ts
import { SourceFileData } from "@/app/lib/interfaces"
export const ADD_FILES = 'ADD_FILES';
export const REMOVE_FILE = 'REMOVE_FILE';
export const UPDATE_FILE = 'UPDATE_FILE';
export const UPDATE_FILES = 'UPDATE_FILES';
export const CLEAR_FILES = 'CLEAR_FILES';

// Action creators
export const addFiles = (files: SourceFileData[]) => ({
  type: ADD_FILES,
  payload: files,
});

export const removeFile = (id: number) => ({
  type: REMOVE_FILE,
  payload: id,
});

export const updateFile = (updatedFile: SourceFileData) => ({
  type: UPDATE_FILE,
  payload: updatedFile,
});

export const updateFiles = (updatedFiles: SourceFileData[]) => ({
  type: UPDATE_FILES,
  payload: updatedFiles,
});

export const clearFiles = () => ({
  type: CLEAR_FILES
});
