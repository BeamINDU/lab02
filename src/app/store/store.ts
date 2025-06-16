import { configureStore } from '@reduxjs/toolkit';
import { fileReducer } from './file/fileReducer';

export const store = configureStore({
  reducer: {
    files: fileReducer,          
    accountingFiles: fileReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {},
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;