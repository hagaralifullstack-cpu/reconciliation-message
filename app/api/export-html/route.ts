import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'index.html');
    let html = await readFile(filePath, 'utf8');

    const { searchParams } = req.nextUrl;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const mistake = searchParams.get('mistake');
    const memory = searchParams.get('memory');
    const direct = searchParams.get('direct');

    const safeJson = (val: string) =>
      JSON.stringify(val).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

    if (from) {
      html = html.replace(
        "senderName: urlParams.get('from') || 'حبيبه',",
        `senderName: urlParams.get('from') || ${safeJson(from)},`
      );
    }
    if (to) {
      html = html.replace(
        "recipientName: urlParams.get('to') || 'خالد',",
        `recipientName: urlParams.get('to') || ${safeJson(to)},`
      );
    }
    if (mistake) {
      html = html.replace(
        "mistake: urlParams.get('mistake') || DEFAULT_APOLOGY,",
        `mistake: urlParams.get('mistake') || ${safeJson(mistake)},`
      );
    }
    if (memory) {
      html = html.replace(
        "specialMemory: urlParams.get('memory') || DEFAULT_MEMORY,",
        `specialMemory: urlParams.get('memory') || ${safeJson(memory)},`
      );
    }
    if (direct === '1') {
      html = html.replace(
        "scene: urlParams.get('gift') === '1' ? 1 : 0,",
        "scene: urlParams.get('setup') === '1' ? 0 : 1,"
      );
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'attachment; filename="index.html"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export index.html' }, { status: 500 });
  }
}
