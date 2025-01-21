import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // รับ factory parameter จาก URL
    const { searchParams } = new URL(request.url);
    const param = searchParams.get('param');
    
    // ถ้าไม่มี factory parameter ให้ return error
    if (!param) {
      return NextResponse.json({ error: 'param parameter is required' }, { status: 400 });
    }    
    const response = await fetch(`http://47.129.168.177:8000/${param}`);    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch camerass' }, { status: 500 });
  }
}