import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // ดึง query parameters จาก request URL
    const { searchParams } = new URL(request.url);
    const param = searchParams.get('param');
    
    if (!param) {
      return NextResponse.json({ error: 'ต้องระบุ param parameter' }, { status: 400 });
    }

    // สร้าง query string ใหม่ โดยรวม query parameters ทั้งหมด
    const queryString = Array.from(searchParams.entries())
      .filter(([key]) => key !== 'param') 
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    // URL สำหรับส่งไป API ปลายทาง

    const targetUrl = `http://47.129.168.177:8000/${param}?${queryString}`;
    console.log('Target URL:', targetUrl);

    // ส่งคำร้องไป API ปลายทาง
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`เกิดข้อผิดพลาดจาก API ปลายทาง: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error('ข้อผิดพลาด:', errorMessage);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเรียก API', message: errorMessage }, { status: 500 });
  }
}

