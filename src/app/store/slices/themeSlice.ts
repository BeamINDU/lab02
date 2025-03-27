import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// กำหนดโครงสร้างข้อมูลของธีม
interface ThemeState {
  mode: "light" | "dark";
}

// ค่าเริ่มต้นของ theme (light mode)
const initialState: ThemeState = {
  mode: "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    // ฟังก์ชันเปลี่ยนธีม
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    
    // ฟังก์ชันตั้งค่าโดยตรง
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.mode = action.payload;
    },
  },
});

// Export actions
export const { toggleTheme, setTheme } = themeSlice.actions;

// Export reducer เพื่อใช้ใน store
export default themeSlice.reducer;
