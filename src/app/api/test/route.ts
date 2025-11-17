import { prisma } from 'src/app/lib/prisma.ts';

export async function GET() {
  const merchants = await prisma.merchant.findMany();
  return Response.json({ ok: true, merchants });
}
