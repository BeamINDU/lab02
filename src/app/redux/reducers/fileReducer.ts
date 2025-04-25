import { ADD_FILES, REMOVE_FILE, UPDATE_FILE, UPDATE_FILES, CLEAR_FILES } from '../actions/fileActions';
import { SourceFileData } from "../../interface/file";

interface FileState {
  fileData: SourceFileData[];
}

const initialState: FileState = {
  fileData: []
};

export const fileReducer = (state = initialState, action: any): FileState => {
  switch (action.type) {

    case ADD_FILES:
      const newFiles = action.payload.map((file: SourceFileData) => ({
        ...file,
        rawFile: undefined,
      }));
      return { ...state, fileData: [...state.fileData, ...newFiles] };

    case REMOVE_FILE:
      return {
        ...state,
        fileData: state.fileData.filter((file) => file.id !== action.payload),
      };

    case UPDATE_FILE:
      return {
        ...state,
        fileData: state.fileData.map((file) =>
          file.id === action.payload.id ? { ...file, ...action.payload } : file
        ),
      };

    case UPDATE_FILES: {
      const updates: SourceFileData[] = action.payload;
    
      // สร้าง Map สำหรับไฟล์ที่มีอยู่แล้ว โดยใช้ id เป็น key
      const existingFilesMap = new Map(state.fileData.map((file) => [file.id, file]));
    
      // อัปเดตข้อมูลไฟล์ที่มีอยู่ใน state และรวมไฟล์ใหม่เข้าด้วยกัน
      const updatedData = updates.map((updatedFile) => {
        if (existingFilesMap.has(updatedFile.id)) {
          // ถ้ามีไฟล์ใน state แล้ว, อัปเดตไฟล์นั้น
          return { ...existingFilesMap.get(updatedFile.id), ...updatedFile };
        }
        // ถ้าไม่มีใน state, ให้แค่เพิ่มไฟล์ใหม่
        return updatedFile;
      });
    
      // เพิ่มไฟล์ใหม่ที่ยังไม่มีใน state
      const newFiles = updates.filter((f) => !existingFilesMap.has(f.id));
    
      return {
        ...state,
        fileData: [...updatedData, ...newFiles], // รวมข้อมูลที่อัปเดตและไฟล์ใหม่
      };
    }
      
    case CLEAR_FILES:
      return {
        ...state,
        fileData: []
      };

    default:
      return state;
  }
};
