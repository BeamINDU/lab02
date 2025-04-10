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
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     serializableCheck: {
  //       // สามารถตั้งค่าได้ว่าต้องการให้ข้ามการตรวจสอบแบบใด
  //       ignoredActions: ['your/action/type'], // action ที่ต้องการข้ามการตรวจสอบ
  //       ignoredPaths: ['files'], // path ที่ใน state จะข้ามการตรวจสอบ
  //     },
  //   }),
}); 

// กำหนดประเภทของ RootState และ AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

