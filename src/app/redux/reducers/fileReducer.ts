import { ADD_FILES, REMOVE_FILE, UPDATE_FILE, CLEAR_FILES } from '../actions';
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
        fileData: state.fileData.filter((item) => item.name !== action.payload),
      };

    case UPDATE_FILE:
      return {
        ...state,
        fileData: state.fileData.map((item) =>
          item.name === action.payload.name ? { ...item, ...action.payload } : item
        ),
      };

    case CLEAR_FILES:
      return {
        ...state,
        fileData: []
      };
    
    default:
      return state;
  }
};
