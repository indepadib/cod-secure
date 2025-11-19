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

    // Si déjà confirmée, on ne recrée pas de double log
    if (existing.status === 'CONFIRMED' && existing.confirmations.length > 0) {
      return NextResponse.json({
        ok: true,
        order: existing,
        message: 'Commande déjà confirmée',
      });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        confirmations:
          existing.confirmations.length === 0
            ? {
                create: {
                  source: 'PUBLIC_LINK',
                },
              }
            : undefined,
      },
      include: {
        confirmations: true,
      },
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (err: any) {
    console.error('API /orders/[orderId]/confirm error', err);
    return NextResponse.json(
      { ok: false, error: 'Erreur serveur', details: err?.message ?? null },
      { status: 500 }
    );
  }
}
