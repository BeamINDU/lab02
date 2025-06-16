import { SourceFileData } from "@/app/lib/interfaces"

export const ADD_ACCOUNTING_FILES = 'ADD_ACCOUNTING_FILES';
export const REMOVE_ACCOUNTING_FILE = 'REMOVE_ACCOUNTING_FILE';
export const UPDATE_ACCOUNTING_FILE = 'UPDATE_ACCOUNTING_FILE';
export const UPDATE_ACCOUNTING_FILES = 'UPDATE_ACCOUNTING_FILES';
export const CLEAR_ACCOUNTING_FILES = 'CLEAR_ACCOUNTING_FILES';

// Action creators for Accounting
export const addAccountingFiles = (files: SourceFileData[]) => ({
  type: ADD_ACCOUNTING_FILES,
  payload: files,
});

export const removeAccountingFile = (id: number) => ({
  type: REMOVE_ACCOUNTING_FILE,
  payload: id,
});

export const updateAccountingFile = (updatedFile: SourceFileData) => ({
  type: UPDATE_ACCOUNTING_FILE,
  payload: updatedFile,
});

export const updateAccountingFiles = (updatedFiles: SourceFileData[]) => ({
  type: UPDATE_ACCOUNTING_FILES,
  payload: updatedFiles,
});

export const clearAccountingFiles = () => ({
  type: CLEAR_ACCOUNTING_FILES
});