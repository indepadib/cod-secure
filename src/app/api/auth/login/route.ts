export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

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
