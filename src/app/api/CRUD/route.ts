import { NextRequest, NextResponse } from 'next/server';


// สำหรับ PUT request
export async function PUT(request: NextRequest) {
    try {
      const body = await request.json();
      const { endpoint } = body;
      const { method: _, endpoint: __, ...dataToSend } = body;
  
      console.log("This is data to send = " + JSON.stringify(dataToSend));
      console.log("This is endpoint = " + `http://47.129.168.177:8000/${endpoint}`)
      const response = await fetch(`http://47.129.168.177:8000/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to process PUT request' }, { status: 500 });
    }
}

// สำหรับ POST request
export async function POST(request: NextRequest) {
    try {
      const body = await request.json();
      const { method = 'POST', endpoint } = body;
      const { method: _, endpoint: __, ...dataToSend } = body;
  
      const response = await fetch(`http://47.129.168.177:8000/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;
    const { method: _, endpoint: __, ...dataToSend } = body;

    const response = await fetch(`http://47.129.168.177:8000/${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process GET request' }, { status: 500 });
  }
}
