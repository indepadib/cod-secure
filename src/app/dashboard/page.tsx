import { getCurrentMerchant } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const merchant = getCurrentMerchant();

  if (!merchant) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Non autorisé</h1>
        <p>Veuillez vous connecter.</p>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { merchantId: merchant.merchantId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ padding: 40 }}>
      <h1>Bienvenue, {merchant.email}</h1>
      <p>Nombre d’ordres COD : {orders.length}</p>

      <a href="/dashboard/create-order">
        <button style={{ marginTop: 20 }}>Créer un ordre COD</button>
      </a>
    </div>
  );
}
