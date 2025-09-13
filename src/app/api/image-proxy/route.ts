import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url') || '';
  if (!url) {
    return new Response('Missing url', { status: 400 });
  }
  try {
    const res = await fetch(url);
    if (!res.ok) return new Response(`Upstream error: ${res.status}`, { status: 502 });
    const contentType = res.headers.get('content-type') || 'image/png';
    const ab = await res.arrayBuffer();
    return new Response(ab, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Proxy failed';
    return new Response(message, { status: 500 });
  }
} 