'use server'

import { SourceFileData, ParamSaveTranslateRequest } from "@/app/lib/interfaces"

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
const translateUrl = process.env.NEXT_PUBLIC_API_TRANSLATION_URL;

export async function saveTranslate(data: ParamSaveTranslateRequest): Promise<SourceFileData> {
  const response = await fetch(`${baseUrl}/save_translate`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Save Translate API Error:', errorText);
    throw new Error(`Save Translate API error: ${response.statusText}`);
  }
  return await response.json();
}

export async function translate(data: string, targetLanguage: string): Promise<string> {
  const response = await fetch(`${translateUrl}/translate`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      q: data,
      source: "auto",
      target: targetLanguage,
      format: "text",
      alternatives: 0,
      api_key: ""
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Translate API Error:', errorText);
    throw new Error(`Translate API error: ${response.statusText}`);
  }
  return await response.text();
}
