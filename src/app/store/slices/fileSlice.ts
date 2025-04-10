// slices/fileSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SourceFileData } from "../../interface/file"

interface FileState {
  input_language: string;
  output_language: string;
  files: SourceFileData[];
}

const initialState: FileState = {
  input_language: 'eng',
  output_language: 'eng',
  files: [],  // กำหนดให้เริ่มต้นเป็น array ว่าง
};

const fileSlice = createSlice({
  name: 'file', // ชื่อของ slice
  initialState,
  reducers: {
    setInputLanguage(state, action: PayloadAction<string>) {
      state.input_language = action.payload; // การอัปเดต input language
    },
    setOutputLanguage(state, action: PayloadAction<string>) {
      state.output_language = action.payload; // การอัปเดต output language
    },
    setFiles(state, action: PayloadAction<SourceFileData[]>) {
      state.files = action.payload; // การอัปเดต files
    },
    addFile(state, action: PayloadAction<SourceFileData>) {
      state.files.push(action.payload); // เพิ่มไฟล์ใหม่
    },
    removeFile(state, action: PayloadAction<number>) {
      state.files = state.files.filter((_, index) => index !== action.payload); // ลบไฟล์
    },
    updateFile(state, action: PayloadAction<SourceFileData>) {
      const index = state.files.findIndex(file => file.id === action.payload.id);
      if (index !== -1) {
        state.files[index] = action.payload; // อัปเดตไฟล์ที่มี id ตรงกัน
      }
    }
  }
});

// ส่งออก actions และ reducer
export const { setInputLanguage, setOutputLanguage, setFiles, addFile, removeFile, updateFile } = fileSlice.actions;
export default fileSlice.reducer;
