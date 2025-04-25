'use server'

import { SourceFileData, OcrRequest } from "../interface/file"

export async function callOcrApi(data: OcrRequest[]): Promise<SourceFileData[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${baseUrl}/ocr`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OCR API Error:', errorText);
    throw new Error(`OCR API error: ${response.statusText}`);
  }
  return await response.json();
}
