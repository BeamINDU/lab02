import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// กำหนดโครงสร้างข้อมูลของผู้ใช้
interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  isAuthenticated: boolean;
}

// กำหนดค่าเริ่มต้นของ state
const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // กำหนดค่าข้อมูลผู้ใช้เมื่อ login
    setUser: (
      state,
      action: PayloadAction<{ id: string; name: string; email: string }>
    ) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.isAuthenticated = true;
    },

    // ล้างค่าผู้ใช้เมื่อ logout
    logoutUser: (state) => {
      state.id = null;
      state.name = null;
      state.email = null;
      state.isAuthenticated = false;
    },
  },
});

// Export action เพื่อนำไปใช้ใน component
export const { setUser, logoutUser } = userSlice.actions;

// Export reducer เพื่อใช้ใน store
export default userSlice.reducer;
