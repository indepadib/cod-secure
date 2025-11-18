export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const email = 'demo@cod-secure.com';
    const plainPassword = 'demo1234';
    const businessName = 'Demo Merchant';

    const existing = await prisma.merchant.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: 'Demo merchant already exists',
        credentials: { email, password: plainPassword },
      });
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const merchant = await prisma.merchant.create({
      data: {
        email,
        passwordHash,
        businessName,
      },
    });

    return NextResponse.json({
      ok: true,
      merchant,
      credentials: { email, password: plainPassword },
    });
  } catch (err: any) {
    console.error('API /seed-merchant error', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}
