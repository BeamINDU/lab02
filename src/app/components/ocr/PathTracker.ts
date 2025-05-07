'use client';

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { clearFiles } from "@/app/store/file/fileActions";

export default function PathTracker() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const dispatch = useDispatch();

  const isTranslatePath = (path: string) =>
    path === "/translate" || path.startsWith("/translate/");

  useEffect(() => {
    const previous = prevPath.current;
    const current = pathname;

    const wasInTranslate = previous && isTranslatePath(previous);
    const pathChanged = previous && previous !== current;

    if (wasInTranslate && pathChanged) {
      dispatch(clearFiles());
    }

    prevPath.current = current;
  }, [pathname]);

  return null;
}
