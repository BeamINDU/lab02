import { configureStore } from "@reduxjs/toolkit";
import imageReducer from "./slices/imageSlice";
import fileReducer from './slices/fileSlice';
import themeReducer from "./slices/themeSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    image: imageReducer,
    files: fileReducer,
    theme: themeReducer,
    user: userReducer,
  },
});

// กำหนดประเภทของ RootState และ AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

