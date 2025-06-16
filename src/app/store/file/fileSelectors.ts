import { RootState } from '../store';

export const selectAllSourceFiles = (state: RootState) => state.files.sourceFiles;

export const selectAllAccountingFiles = (state: RootState) => state.accountingFiles.sourceFiles;

export const selectFileById = (id: number) => 
  (state: RootState) => state.files.sourceFiles.find(file => file.id === id);

export const selectAccountingFileById = (id: number) => 
  (state: RootState) => state.accountingFiles.sourceFiles.find(file => file.id === id);