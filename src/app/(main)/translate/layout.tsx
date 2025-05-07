'use client';

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearFiles } from "@/app/store/file/fileActions";

export default function TranslateLayout({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(clearFiles());
    };
  }, []);

  return <>{children}</>;
}
