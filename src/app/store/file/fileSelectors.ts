import { RootState } from '../store';

export const selectAllSourceFiles = (state: RootState) => state.files.sourceFiles;

export const selectFileById = (id: number) => 
  (state: RootState) => state.files.sourceFiles.find(file => file.id === id);

export const selectFileByName = (name: string) => 
  (state: RootState) => state.files.sourceFiles.find(file => file.fileName === name);
