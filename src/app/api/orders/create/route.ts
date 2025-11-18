export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const merchantId = cookieStore.get('merchantId')?.value;

    if (!merchantId) {
      return NextResponse.json(
        { ok: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { customerName, customerPhone, productName, price } = body ?? {};

    if (!customerName || !customerPhone || !productName || !price) {
      return NextResponse.json(
        { ok: false, error: 'Champs obligatoires manquants' },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        merchantId,
        customerName,
        customerPhone,
        productName,
        price: Number(price),
        status: 'PENDING',
      },
    });

    return NextResponse.json({ ok: true, order });
  } catch (err: any) {
    console.error('API /orders/create error', err);
    return NextResponse.json(
      { ok: false, error: 'Erreur serveur', details: err?.message ?? null },
      { status: 500 }
    );
  }
}
