// selectors/fileSelectors.ts
import { RootState } from '../store';

export const selectAllSourceFiles = (state: RootState) => state.files.fileData;

export const selectFileById = (id: number) => 
  (state: RootState) => state.files.fileData.find(file => file.id === id);

export const selectFileByName = (name: string) => 
  (state: RootState) => state.files.fileData.find(file => file.fileName === name);
