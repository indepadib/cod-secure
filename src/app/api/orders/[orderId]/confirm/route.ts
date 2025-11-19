export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

interface RouteContext {
  params: { orderId: string };
}

export async function POST(_req: Request, { params }: RouteContext) {
  const { orderId } = params;

  try {
    // 1) Vérifier que la commande existe
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: 'Commande introuvable' },
        { status: 404 }
      );
    }

    // 2) Si déjà confirmée, on ne refait rien (idempotent)
    if (existing.status === 'CONFIRMED') {
      return NextResponse.json({
        ok: true,
        order: existing,
        message: 'Commande déjà confirmée',
      });
    }

    // 3) Transaction : update + log de confirmation
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
        },
      }),
      prisma.confirmation.create({
        data: {
          orderId: orderId,
          source: 'PUBLIC_LINK',
        },
      }),
    ]);

    // 4) Retourner la commande mise à jour
    return NextResponse.json({ ok: true, order: updatedOrder });
  } catch (err: any) {
    console.error('API /orders/[orderId]/confirm error', err);
    return NextResponse.json(
      { ok: false, error: 'Erreur serveur', details: err?.message ?? null },
      { status: 500 }
    );
  }
}
