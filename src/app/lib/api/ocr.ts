'use server'

import { SourceFileData, ParamOcrRequest, ParamSaveOcrRequest } from "@/app/lib/interfaces"

const baseUrl = process.env.NEXT_PUBLIC_API_URL;


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

export async function ocrReader(data: ParamOcrRequest[]): Promise<SourceFileData[]> {
  const startTime = Date.now();
  const formatTime = (ms: number) => new Date(ms).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  console.log(`[OCR] Start request at ${formatTime(startTime)}`);

  try {
    const response = await fetchWithTimeout(`${baseUrl}/ocr`, {
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

    const result = await response.json();
    const endTime = Date.now();
    console.log(`[OCR] End request at ${formatTime(endTime)} (Duration ${endTime - startTime} ms)`);

    return result;
  } catch (error: any) {
    const failTime = Date.now();
    console.error(`[OCR] Request failed at ${formatTime(failTime)} (Duration ${failTime - startTime} ms)`);
  
    if (error?.cause?.code === 'UND_ERR_HEADERS_TIMEOUT') {
      throw new Error('OCR request failed due to headers timeout');
    }
  
    if (error.name === 'AbortError') {
      throw new Error('OCR request timed out after 1 hour');
    }
  
    throw error;
  }
}

async function fetchWithTimeout(
  resource: string,
  options: RequestInit = {},
  timeoutMs = 7200000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const { signal } = controller;

  try {
    return await fetch(resource, { ...options, signal });
  } finally {
    clearTimeout(id);
  }
}


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
