import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { originalText, source, target } = body;

    const res = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: originalText,
        source: source || 'auto',
        target: target || 'en',
        format: 'text',
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'LibreTranslate error' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ translatedText: data.translatedText });
  } catch (err) {
    console.error('Translation API Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
