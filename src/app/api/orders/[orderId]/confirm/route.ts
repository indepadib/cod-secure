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

    // 2) Si déjà confirmée → idempotent
    if (existing.status === 'CONFIRMED') {
      return NextResponse.json({
        ok: true,
        order: existing,
        message: 'Commande déjà confirmée',
      });
    }

    // 3) Met à jour uniquement le statut (et updatedAt via Prisma/@updatedAt)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        // si tu n'as pas @updatedAt dans le schema, décommente :
        // updatedAt: new Date(),
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
