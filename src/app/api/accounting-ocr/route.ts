import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // รับข้อมูลจาก frontend
    const requestData = await request.json();
    
    // ตรวจสอบข้อมูลพื้นฐาน
    if (!Array.isArray(requestData) || requestData.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: 'Request must be a non-empty array'
        },
        { status: 400 }
      );
    }

    // ตรวจสอบข้อมูลแต่ละไฟล์
    for (let i = 0; i < requestData.length; i++) {
      const file = requestData[i];
      if (!file.fileName || !file.fileType || !file.base64Data) {
        return NextResponse.json(
          { 
            error: 'Invalid file data',
            details: `File ${i} (${file.fileName || 'unnamed'}) missing required fields`
          },
          { status: 400 }
        );
      }

      // ตรวจสอบ base64 format
      if (!file.base64Data.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
        return NextResponse.json(
          { 
            error: 'Invalid base64 format',
            details: `File ${file.fileName} contains invalid base64 data`
          },
          { status: 400 }
        );
      }
    }

    // กำหนด timeout ตามประเภทไฟล์
    const hasPdf = requestData.some((file: any) => file.fileType === 'application/pdf');
    const timeoutMs = hasPdf ? 300000 : 60000; 

    // ส่งต่อไปยัง OCR API
    const response = await fetch('http://192.168.11.97:8111/ocr_format', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
      signal: AbortSignal.timeout(timeoutMs),
    });

    // จัดการ response ที่ไม่สำเร็จ
    if (!response.ok) {
      let errorDetails;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          errorDetails = await response.json();
        } else {
          errorDetails = await response.text();
        }
      } catch {
        errorDetails = 'Cannot parse error response';
      }
      
      return NextResponse.json(
        { 
          error: `OCR API Error: ${response.status} ${response.statusText}`,
          details: typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)
        },
        { status: response.status }
      );
    }

    // แปลง response เป็น JSON
    let ocrResult;
    try {
      ocrResult = await response.json();
    } catch {
      return NextResponse.json(
        { 
          error: 'Invalid OCR API response',
          details: 'OCR API returned non-JSON response'
        },
        { status: 502 }
      );
    }

    // ตรวจสอบ response structure
    if (!Array.isArray(ocrResult)) {
      return NextResponse.json(
        { 
          error: 'Invalid OCR API response format',
          details: `Expected array but got ${typeof ocrResult}`
        },
        { status: 502 }
      );
    }

    return NextResponse.json(ocrResult);

  } catch (error) {
    // จัดการ timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          error: 'Request timeout',
          details: 'The OCR service took too long to respond. PDF files may require more processing time.'
        },
        { status: 408 }
      );
    }

    // จัดการ connection error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Cannot connect to OCR service',
          details: 'Connection failed. Please check if OCR service is running.'
        },
        { status: 503 }
      );
    }

    // จัดการ error อื่นๆ
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}