import { NextRequest } from 'next/server';
import { Buffer } from 'buffer';
import path from 'path';
import fs from 'fs/promises';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url') || '';
  const baseName = (searchParams.get('filename') || 'mamette-cover').replace(/\/+|\\+/g, '');
  const filename = baseName.match(/\.[a-zA-Z0-9]+$/) ? baseName : `${baseName}.png`;

  if (!url) {
    return new Response(JSON.stringify({ error: 'Missing url' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    let contentType = 'image/png';
    let data: ArrayBuffer;

    if (url.startsWith('data:image/')) {
      const match = url.match(/^data:(.*?);base64,(.*)$/);
      if (!match) throw new Error('Invalid data URL');
      contentType = match[1] || contentType;
      const b64 = match[2];
      const buf = Buffer.from(b64, 'base64');
      data = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    } else {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      contentType = res.headers.get('content-type') || contentType;
      data = await res.arrayBuffer();
    }

    // Optionally save locally (dev convenience)
    const shouldSave = process.env.MAMETTE_SAVE_EXPORTS === 'true' || process.env.NODE_ENV !== 'production';
    if (shouldSave) {
      try {
        const exportsDir = path.join(process.cwd(), 'public', 'exports');
        await fs.mkdir(exportsDir, { recursive: true });
        const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${filename}`;
        const filePath = path.join(exportsDir, unique);
        await fs.writeFile(filePath, Buffer.from(data));
        // We don't redirect; we still stream back for immediate download
      } catch {
        // ignore save errors
      }
    }

    return new Response(Buffer.from(data), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Export failed';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
} 