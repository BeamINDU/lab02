'use client';

import { useState } from 'react';
import { ocrReader } from '@/app/lib/api/ocr';
import OcrResultComponent from './OcrResult';
import { SourceFileData, ParamOcrRequest } from "@/app/lib/interfaces";
import { convertBase64ToBlobUrl } from '@/app/lib/utils/file';

export default function OcrForm() {
  const [results, setResults] = useState<SourceFileData[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setResults(null);
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setLoading(true); 

    try {
      const allResults: SourceFileData[] = [];
      const ocrRequest: ParamOcrRequest[] = [];

      for (const file of files) {
        const base64 = await readFileAsBase64(file);
        ocrRequest.push(
          {
            fileName: file.name,
            fileType: file.type,
            base64Data: base64,
          }
        )
      }

      const rawResult = await ocrReader(ocrRequest);

      const enhanced = rawResult.map((item) => ({
        ...item,
        ocrResult: item.ocrResult?.map((page) => ({
          ...page,
          blobUrl: page.base64Data ? convertBase64ToBlobUrl(page.base64Data) : '',
        })) ?? [],
      }));
      allResults.push(...enhanced);

      setResults(allResults);
    } catch (error) {
      console.error("OCR processing failed:", error);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-4">
      <input
        multiple
        type="file"
        accept=".pdf,.png,.jpg,.jepg"
        capture="environment"
        onChange={handleFileChange}
      />
      {loading && <p>Processing...</p>}
      {results && <OcrResultComponent result={results} />}
    </div>
  );
}
