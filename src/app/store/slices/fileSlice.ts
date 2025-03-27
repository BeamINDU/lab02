// slices/fileSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SourceFileData } from "../../interface/file"

interface FileState {
  language: string;
  files: SourceFileData[];
}

const initialState: FileState = {
  language: 'English',
  files: [],  // กำหนดให้เริ่มต้นเป็น array ว่าง
};

const fileSlice = createSlice({
  name: 'file', // ชื่อของ slice
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload; // การอัปเดต language
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
      const index = state.files.findIndex(file => file.no === action.payload.no);
      if (index !== -1) {
        state.files[index] = action.payload; // อัปเดตไฟล์ที่มี no ตรงกัน
      }
    }
  }
});

// ส่งออก actions และ reducer
export const { setLanguage, setFiles, addFile, removeFile, updateFile } = fileSlice.actions;
export default fileSlice.reducer;
