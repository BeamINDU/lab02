// src/app/api/accounting-ocr/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // รับข้อมูลจาก frontend
    const requestData = await request.json();
    
    console.log('Proxying request to accounting OCR API:', {
      url: 'http://192.168.128.40:8111/ocr_format',
      filesCount: requestData.length,
      files: requestData.map((file: any) => ({
        fileName: file.fileName,
        fileType: file.fileType,
        base64Size: file.base64Data ? file.base64Data.length : 0,
        base64Preview: file.base64Data ? file.base64Data.substring(0, 50) + '...' : 'empty'
      }))
    });

    // ตรวจสอบข้อมูลก่อนส่ง
    for (const file of requestData) {
      if (!file.fileName || !file.fileType || !file.base64Data) {
        return NextResponse.json(
          { 
            error: 'Invalid request data',
            details: 'Missing required fields: fileName, fileType, or base64Data'
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

    // ลองเช็ค connectivity ก่อน
    console.log('Testing connectivity to OCR API...');
    
    // ส่งต่อไปยัง OCR API
    const response = await fetch('http://192.168.128.40:8111/ocr_format', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    console.log('OCR API response status:', response.status, response.statusText);

    // ตรวจสอบสถานะของ response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OCR API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        requestData: requestData.map((file: any) => ({
          fileName: file.fileName,
          fileType: file.fileType,
          base64Length: file.base64Data?.length || 0
        }))
      });
      
      return NextResponse.json(
        { 
          error: `OCR API Error: ${response.status} ${response.statusText}`,
          details: errorText,
          apiUrl: 'http://192.168.128.40:8111/ocr_format',
          requestSummary: `${requestData.length} files sent`
        },
        { status: response.status }
      );
    }

    // รับข้อมูลจาก OCR API
    const ocrResult = await response.json();
    console.log('OCR API Response received, files processed:', ocrResult.length);

    // ส่งกลับไปยัง frontend
    return NextResponse.json(ocrResult);

  } catch (error) {
    console.error('Proxy error:', error);
    
    // จัดการข้อผิดพลาดต่างๆ แบบละเอียด
    if (error instanceof TypeError) {
      if (error.message.includes('fetch')) {
        return NextResponse.json(
          { 
            error: 'Cannot connect to OCR service',
            details: 'The OCR service at 192.168.128.40:8111 is not reachable. Please check:\n1. Is the service running?\n2. Is the IP address correct?\n3. Is there a firewall blocking the connection?',
            debugInfo: {
              targetUrl: 'http://192.168.128.40:8111/ocr_format',
              errorType: 'Connection Error',
              errorMessage: error.message
            }
          },
          { status: 503 }
        );
      }
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          error: 'Request timeout',
          details: 'The OCR service took too long to respond (> 30 seconds)'
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        debugInfo: {
          errorType: error?.constructor?.name || 'Unknown',
          stack: process.env.NODE_ENV === 'development' ? (error as Error)?.stack : undefined
        }
      },
      { status: 500 }
    );
  }
}