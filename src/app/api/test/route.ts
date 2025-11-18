export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany();
    return NextResponse.json({ ok: true, merchants });
  } catch (err: any) {
    console.error('API /test error', err);
    return NextResponse.json(
      { ok: false, error: 'DB error', details: err?.message ?? null },
      { status: 500 }
    );
  }
}
