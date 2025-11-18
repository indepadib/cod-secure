export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentMerchant } from '../../../../lib/auth';

export async function POST(req: Request) {
  const merchant = getCurrentMerchant();

  if (!merchant) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();

  const order = await prisma.order.create({
    data: {
      merchantId: merchant.merchantId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      productName: body.productName,
      price: body.price,
    },
  });

  return NextResponse.json({ ok: true, order });
}
