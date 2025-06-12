// src/app/api/test-connectivity/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing connectivity to OCR service...');
    
    // ทดสอบการเชื่อมต่อพื้นฐาน
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    const response = await fetch('http://192.168.128.40:8111/docs', {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      reachable: response.ok,
      timestamp: new Date().toISOString(),
    };

    console.log('Connectivity test result:', result);

    return NextResponse.json({
      success: true,
      message: 'OCR service is reachable',
      details: result
    });

  } catch (error) {
    console.error('Connectivity test failed:', error);

    let errorDetails = {
      reachable: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name || 'Unknown'
    };

    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorDetails.error = 'Network connection failed - service may be down or unreachable';
    } else if (error instanceof Error && error.name === 'AbortError') {
      errorDetails.error = 'Connection timeout - service took too long to respond';
    }

    return NextResponse.json({
      success: false,
      message: 'OCR service is not reachable',
      details: errorDetails
    }, { status: 503 });
  }
}