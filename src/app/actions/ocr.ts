'use server'

import { SourceFileData, OcrRequest, TranslateRequest } from "../interface/file"

export async function getOcrFiles(): Promise<SourceFileData[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${baseUrl}/ocr`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GET OCR API Error:', errorText);
    throw new Error(`GET OCR API error: ${response.statusText}`);
  }
  return await response.json();
}

export async function submitOcrRequest(data: OcrRequest[]): Promise<SourceFileData[]> {
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

export async function submitTranslateRequest(data: TranslateRequest[]): Promise<SourceFileData[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${baseUrl}/translate`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Translate API Error:', errorText);
    throw new Error(`Translate API error: ${response.statusText}`);
  }
  return await response.json();
}
