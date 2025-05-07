import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  try {
    const res = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: 'th',
        format: 'text',
      }),
    });

    const data = await res.json();
    return NextResponse.json({ translatedText: data.translatedText });
  } catch (error) {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
