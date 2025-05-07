// redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { fileReducer } from './file/fileReducer';
// import { ADD_FILES } from './file/fileActions';

export const store = configureStore({
  reducer: {
    files: fileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ignoredActions: [ADD_FILES],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
