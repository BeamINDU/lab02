import { configureStore } from '@reduxjs/toolkit';
import { fileReducer } from './file/fileReducer';
import { accountingFileReducer } from './file/accountingFileReducer';

export const store = configureStore({
  reducer: {
    files: fileReducer,                    // สำหรับ OCR Reading
    accountingFiles: accountingFileReducer, // สำหรับ Accounting OCR (แยกแล้ว)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {},
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;