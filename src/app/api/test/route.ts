export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const merchants = await prisma.merchant.findMany();
  return NextResponse.json({ ok: true, merchants });
}
