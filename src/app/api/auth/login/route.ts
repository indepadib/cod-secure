 export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

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
      return NextResponse.json(
        { ok: false, error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    // ✅ On pose un cookie simple avec l'id du marchand
    const cookieStore = cookies();
    cookieStore.set('merchantId', merchant.id, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

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
