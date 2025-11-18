export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { cookies } from 'next/headers';
import { prisma } from '../../lib/prisma';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const merchantId = cookieStore.get('merchantId')?.value;

  if (!merchantId) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Non autorisé</h1>
        <p>Veuillez vous connecter.</p>
      </div>
    );
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
  });

  if (!merchant) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Non autorisé</h1>
        <p>Compte marchand introuvable.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard COD-Secure</h1>
      <p>
        Connecté en tant que <strong>{merchant.businessName}</strong> ({merchant.email})
      </p>

      <p style={{ marginTop: 24 }}>
        (La section commandes arrive juste après, là on valide d’abord l’auth.)
      </p>
    </div>
  );
}
