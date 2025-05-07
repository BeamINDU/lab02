import { ADD_FILES, REMOVE_FILE, UPDATE_FILE, UPDATE_FILES, CLEAR_FILES } from './fileActions';
import { SourceFileData } from "@/app/lib/interfaces"

interface FileState {
  sourceFiles: SourceFileData[];
}

const initialState: FileState = {
  sourceFiles: []
};

export const fileReducer = (state = initialState, action: any): FileState => {
  switch (action.type) {

    case ADD_FILES:
      const newFiles = action.payload.map((file: SourceFileData) => ({
        ...file,
      }));
      return { ...state, sourceFiles: [...state.sourceFiles, ...newFiles] };

    case REMOVE_FILE:
      return {
        ...state,
        sourceFiles: state.sourceFiles.filter((file) => file.id !== action.payload),
      };

    case UPDATE_FILE:
      return {
        ...state,
        sourceFiles: state.sourceFiles.map((file) =>
          file.id === action.payload.id ? { ...file, ...action.payload } : file
        ),
      };

    case UPDATE_FILES: {
      const updates: SourceFileData[] = action.payload;
    
      // Map of updated files by id
      const updateMap = new Map(updates.map((file) => [file.id, file]));
    
      // Merge updates into existing files
      const mergedFiles = state.sourceFiles.map((file) =>
        updateMap.has(file.id)
          ? { ...file, ...updateMap.get(file.id) }
          : file
      );
    
      // Add any new files that weren't in the original state
      const newFiles = updates.filter((f) =>
        !state.sourceFiles.some((file) => file.id === f.id)
      );
    
      return {
        ...state,
        sourceFiles: [...mergedFiles, ...newFiles],
      };
    }
    
      
    case CLEAR_FILES:
      return {
        ...state,
        sourceFiles: []
      };

    default:
      return state;
  }
};
