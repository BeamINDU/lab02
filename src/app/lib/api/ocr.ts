'use server'

import { SourceFileData, ParamOcrRequest, ParamSaveOcrRequest } from "@/app/lib/types"

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function ocrReader(data: ParamOcrRequest[]): Promise<SourceFileData[]> {
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

export async function saveOcr(data: ParamSaveOcrRequest): Promise<SourceFileData> {
  const response = await fetch(`${baseUrl}/save_ocr`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SAVE OCR API Error:', errorText);
    throw new Error(`SAVE OCR API error: ${response.statusText}`);
  }
  return await response.json();
}


export async function getOcr(userId: string): Promise<SourceFileData[]> {
  const response = await fetch(`${baseUrl}/get_ocr?user_id=${userId}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GET OCR API Error:', errorText);
    throw new Error(`GET OCR API error: ${response.statusText}`);
  }
  return await response.json();
}

// export async function ocrFromImage(image: Blob): Promise<string> {
//   const formData = new FormData();
//   formData.append('file', image);

//   const res = await fetch('https://api.ocr.space/parse/image', {
//     method: 'POST',
//     headers: {
//       apikey: 'your_ocr_api_key_here',
//     },
//     body: formData,
//   });

//   const data = await res.json();
//   return data?.ParsedResults?.[0]?.ParsedText || '';
// }

// export async function sendImageToOCR(blob: Blob): Promise<string> {
//   const formData = new FormData();
//   formData.append('file', blob);

//   const res = await fetch('/api/ocr', {
//     method: 'POST',
//     body: formData,
//   });

//   const { text } = await res.json();
//   return text;
// }
