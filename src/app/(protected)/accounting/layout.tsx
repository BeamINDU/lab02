'use client';

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearAccountingFiles } from "@/app/store/file/accountingFileActions";

export default function AccountingLayout({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear accounting files เมื่อออกจากหน้า
    return () => {
      dispatch(clearAccountingFiles());
    };
  }, []);

  return <>{children}</>;
}