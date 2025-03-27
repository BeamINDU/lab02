"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUser, logoutUser } from "../store/slices/userSlice";

export default function Login() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const handleLogin = () => {
    dispatch(
      setUser({ id: "1", name: "Administrator", email: "admin@ocr.com" })
    );
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div>
      {user.isAuthenticated ? (
        <>
          <p>👋 สวัสดี, {user.name} ({user.email})</p>
          <button onClick={handleLogout}>ออกจากระบบ</button>
        </>
      ) : (
        <>
          <p>กรุณาเข้าสู่ระบบ</p>
          <button onClick={handleLogin}>เข้าสู่ระบบ</button>
        </>
      )}
    </div>
  );
}
