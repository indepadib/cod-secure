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
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        confirmations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: 'Commande introuvable' },
        { status: 404 }
      );
    }

    // Si déjà confirmée, on ne refait rien (idempotent)
    if (existing.status === 'CONFIRMED') {
      return NextResponse.json({
        ok: true,
        order: existing,
        message: 'Commande déjà confirmée',
      });
    }

    // 1) Met à jour le statut
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
      },
    });

    // 2) Crée un log de confirmation (si pas déjà existant pour cette source)
    await prisma.confirmation.create({
      data: {
        orderId: orderId,
        source: 'PUBLIC_LINK',
      },
    });

    return NextResponse.json({ ok: true, order: updatedOrder });
  } catch (err: any) {
    console.error('API /orders/[orderId]/confirm error', err);
    return NextResponse.json(
      { ok: false, error: 'Erreur serveur', details: err?.message ?? null },
      { status: 500 }
    );
  }
}
