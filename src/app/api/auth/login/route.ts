export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const merchant = await prisma.merchant.findUnique({
      where: { email },
    });

    if (!merchant) {
      return NextResponse.json(
        { ok: false, error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, merchant.passwordHash);

    if (!isValid) {
      const token = jwt.sign(
  {
    merchantId: merchant.id,
    email: merchant.email,
  },
  process.env.SESSION_SECRET!,
  { expiresIn: '7d' }
);

cookies().set('session', token, {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
});

return NextResponse.json({
  ok: true,
  merchant: {
    id: merchant.id,
    email: merchant.email,
    businessName: merchant.businessName,
  },
});
    }

    return NextResponse.json({
      ok: true,
      merchant: {
        id: merchant.id,
        email: merchant.email,
        businessName: merchant.businessName,
      },
    });
  } catch (err: any) {
    console.error('API /auth/login error', err);
    return NextResponse.json(
      { ok: false, error: 'Erreur serveur', details: err?.message ?? null },
      { status: 500 }
    );
  }
}
