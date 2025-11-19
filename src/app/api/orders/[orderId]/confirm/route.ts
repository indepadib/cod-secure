export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req, { params }) {
  try {
    const orderId = params.orderId;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Commande introuvable" },
        { status: 404 }
      );
    }

    // Mise à jour + log Confirmation
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        confirmations: {
          create: {
            source: "PUBLIC_LINK"
          }
        }
      },
      include: {
        confirmations: true
      }
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (err) {
    console.error("CONFIRM ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur", details: err.message },
      { status: 500 }
    );
  }
}
