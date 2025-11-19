export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../../lib/prisma';
import { sendOrderConfirmationWhatsApp } from '../../../../lib/whatsapp';

interface CreateOrderBody {
  customerName: string;
  customerPhone: string;
  productName: string;
  price: number;
}

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

    const body = (await req.json()) as Partial<CreateOrderBody>;
    const { customerName, customerPhone, productName, price } = body;

    if (!customerName || !customerPhone || !productName || !price) {
      return NextResponse.json(
        { ok: false, error: 'Champs manquants' },
        { status: 400 }
      );
    }

    // 1) Créer l’ordre en base
    const order = await prisma.order.create({
      data: {
        merchantId,
        customerName,
        customerPhone,
        productName,
        totalAmount: price,
        depositAmount: 0,
        status: 'PENDING',
      },
    });

    // 2) Construire l’URL publique de confirmation
    const baseUrl =
      process.env.PUBLIC_BASE_URL || new URL(req.url).origin;
    const confirmUrl = `${baseUrl}/o/${order.id}`;

    // 3) Envoi WhatsApp (fire & forget)
    sendOrderConfirmationWhatsApp({
      customerName,
      customerPhone,
      productName,
      totalAmount: price,
      confirmUrl,
    }).catch((err) => {
      console.error('sendOrderConfirmationWhatsApp failed', err);
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
