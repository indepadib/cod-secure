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

  const orders = await prisma.order.findMany({
    where: { merchantId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard COD-Secure</h1>
      <p>
        Connecté en tant que <strong>{merchant.businessName}</strong> ({merchant.email})
      </p>

      <div style={{ marginTop: 24 }}>
        <a href="/dashboard/create-order">
          <button style={{ padding: 10, borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            Créer un ordre COD
          </button>
        </a>
      </div>

      <h2 style={{ marginTop: 32 }}>Vos ordres COD</h2>

      {orders.length === 0 && <p>Aucun ordre pour le moment.</p>}

      {orders.length > 0 && (
        <table style={{ marginTop: 16, borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
  <tr>
    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Client</th>
    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Téléphone</th>
    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Produit</th>
    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Prix</th>
    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Statut</th>
    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Créé le</th>
    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Lien public</th>
  </tr>
</thead>
<tbody>
  {orders.map((o) => (
    <tr key={o.id}>
      <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{o.customerName}</td>
      <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{o.customerPhone}</td>
      <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{o.productName}</td>
      <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{o.totalAmount} MAD</td>
      <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{o.status}</td>
      <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
        {new Date(o.createdAt).toLocaleString()}
      </td>
      <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
        <a
          href={`/o/${o.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12 }}
        >
          Ouvrir
        </a>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      )}
    </div>
  );
}
