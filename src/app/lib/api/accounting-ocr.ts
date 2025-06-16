'use server'

import { request } from 'undici';
import { SourceFileData, ParamOcrRequest, ParamSaveOcrRequest } from "@/app/lib/interfaces"

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const formatTime = (ms: number) => new Date(ms).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });


export async function getAccountingOcr(userId: string): Promise<SourceFileData[]> {
  const response = await fetch(`${baseUrl}/get_accounting_ocr?user_id=${userId}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GET Accounting OCR API Error:', errorText);
    throw new Error(`GET Accounting OCR API error: ${response.statusText}`);
  }
  return await response.json();
}


export async function saveAccountingOcr(data: any): Promise<string> {
  const startTime = Date.now();
  
  console.log(`[Save Invoice] Start request at ${formatTime(startTime)}`);

  try {
    const { body, statusCode } = await request(`${baseUrl}/save_invoice`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(data),
      headersTimeout: 300000, 
      bodyTimeout: 300000,
    });

    const text = await body.text();

    if (statusCode >= 400) {
      console.error('Save Invoice API Error:', statusCode, text);
      throw new Error(`Save Invoice API error (${statusCode}): ${text}`);
    }

    const endTime = Date.now();
    console.log(`[Save Invoice] End request at ${formatTime(endTime)} (Duration ${endTime - startTime} ms)`);

    return text;

  } catch (error: any) {
    const failTime = Date.now();
    console.error(`[Save Invoice] Request failed at ${formatTime(failTime)} (Duration ${failTime - startTime} ms)`);

    if (error?.cause?.code === 'UND_ERR_HEADERS_TIMEOUT') {
      throw new Error('Save Invoice request failed due to headers timeout');
    }

    if (error.name === 'AbortError') {
      throw new Error('Save Invoice request timed out');
    }

    throw error;
  }
}


export async function accountingOcrReader(data: ParamOcrRequest[]): Promise<SourceFileData[]> {
  const startTime = Date.now();
  
  console.log(`[Accounting OCR] Start request at ${formatTime(startTime)}`);

  try {
    const { body, statusCode } = await request(`${baseUrl}/ocr_format`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(data),
      headersTimeout: 7200000, // 2 Hour
      bodyTimeout: 7200000,
    });

    const text = await body.text();

    if (statusCode >= 400) {
      console.error('Accounting OCR API Error:', text);
      throw new Error(`Accounting OCR API error (${statusCode}): ${text}`);
    }

    const result = JSON.parse(text);
    const endTime = Date.now();
    console.log(`[Accounting OCR] End request at ${formatTime(endTime)} (Duration ${endTime - startTime} ms)`);

    return result;
  } catch (error: any) {
    const failTime = Date.now();
    console.error(`[Accounting OCR] Request failed at ${formatTime(failTime)} (Duration ${failTime - startTime} ms)`);

    if (error?.cause?.code === 'UND_ERR_HEADERS_TIMEOUT') {
      throw new Error('Accounting OCR request failed due to headers timeout');
    }

    if (error.name === 'AbortError') {
      throw new Error('Accounting OCR request timed out');
    }

    throw error;
  }
}