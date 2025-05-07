'use server'

import { SourceFileData, TranslateResult, ParamSaveTranslateRequest } from "@/app/lib/types"

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
const translateUrl = process.env.NEXT_PUBLIC_API_TRANSLATION_URL;

export async function translate(data: string, targetLanguage: string): Promise<TranslateResult> {
  const response = await fetch(`${translateUrl}/translate`, {
    method: "POST",
    body: JSON.stringify({
      q: data,
      source: "auto",
      target: targetLanguage,
      format: "text",
      alternatives: 0,
      // api_key: ""
    }),
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Translate API Error:', errorText);
    throw new Error(`Translate API error: ${response.statusText}`);
  }
  return await response.json();
}

export async function saveTranslate(data: ParamSaveTranslateRequest[]): Promise<SourceFileData[]> {
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

// export async function translateText(text: string): Promise<string> {
//   const res = await fetch('https://libretranslate.de/translate', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       q: text,
//       source: 'en',
//       target: 'th',
//       format: 'text',
//     }),
//   });

//   const data = await res.json();
//   return data.translatedText;
// }

// export async function translateToThai(text: string): Promise<string> {
//   const res = await fetch('/api/translate', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ text }),
//   });

//   const data = await res.json();
//   return data.translatedText;
// }
