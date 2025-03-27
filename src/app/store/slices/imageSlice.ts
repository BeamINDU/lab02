import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ImageState {
  imageUrl: string;
  cropData: { x: number; y: number; width: number; height: number } | null;
}

const initialState: ImageState = {
  imageUrl: "",
  cropData: null,
};

const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {
    setImageUrl: (state, action: PayloadAction<string>) => {
      state.imageUrl = action.payload;
    },
    setCropData: (
      state,
      action: PayloadAction<{ x: number; y: number; width: number; height: number }>
    ) => {
      state.cropData = action.payload;
    },
    resetImage: (state) => {
      state.imageUrl = "";
      state.cropData = null;
    },
  },
});

export const { setImageUrl, setCropData, resetImage } = imageSlice.actions;
export default imageSlice.reducer;
