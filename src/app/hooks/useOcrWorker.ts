import { useEffect, useRef } from "react";
import { createWorker, Worker } from "tesseract.js";
import { GlobalWorkerOptions } from "pdfjs-dist";

export default function useOcrWorker(language = "eng") {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';
    }

    const initWorker = async () => {
      const worker = await createWorker(language, 1, {
        logger: (m) => console.log(m),
      });
      workerRef.current = worker;
    };

    initWorker();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [language]);

  return workerRef;
}
