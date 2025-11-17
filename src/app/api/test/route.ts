import { prisma } from '@/src/lib/prisma';

export async function GET() {
  const merchants = await prisma.merchant.findMany();
  return Response.json({ ok: true, merchants });
}
