import { 
  ADD_ACCOUNTING_FILES, REMOVE_ACCOUNTING_FILE, UPDATE_ACCOUNTING_FILE, 
  UPDATE_ACCOUNTING_FILES, CLEAR_ACCOUNTING_FILES 
} from './accountingFileActions';
import { SourceFileData } from "@/app/lib/interfaces"

interface AccountingFileState {
  sourceFiles: SourceFileData[];
}

const initialState: AccountingFileState = {
  sourceFiles: []
};

export const accountingFileReducer = (state = initialState, action: any): AccountingFileState => {
  switch (action.type) {
    case ADD_ACCOUNTING_FILES:
      const newFiles = action.payload.map((file: SourceFileData) => ({
        ...file,
      }));
      return { ...state, sourceFiles: [...state.sourceFiles, ...newFiles] };

    case REMOVE_ACCOUNTING_FILE:
      return {
        ...state,
        sourceFiles: state.sourceFiles.filter((file) => file.id !== action.payload),
      };

    case UPDATE_ACCOUNTING_FILE:
      return {
        ...state,
        sourceFiles: state.sourceFiles.map((file) =>
          file.id === action.payload.id ? { ...file, ...action.payload } : file
        ),
      };

    case UPDATE_ACCOUNTING_FILES: {
      const updates: SourceFileData[] = action.payload;
      const updateMap = new Map(updates.map((file) => [file.id, file]));
      const mergedFiles = state.sourceFiles.map((file) =>
        updateMap.has(file.id) ? { ...file, ...updateMap.get(file.id) } : file
      );
      const newFiles = updates.filter((f) =>
        !state.sourceFiles.some((file) => file.id === f.id)
      );
      return { ...state, sourceFiles: [...mergedFiles, ...newFiles] };
    }
    
    case CLEAR_ACCOUNTING_FILES:
      return { ...state, sourceFiles: [] };

    default:
      return state;
  }
};