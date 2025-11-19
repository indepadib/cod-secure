export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import ConfirmOrderButton from './ConfirmOrderButton';
import { prisma } from '../../../lib/prisma';

interface PublicOrderPageProps {
  params: { orderId: string };
}

export default async function PublicOrderPage({ params }: PublicOrderPageProps) {
  const { orderId } = params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      customerName: true,
      customerPhone: true,
      customerAddress: true,
      productName: true,
      totalAmount: true,
      depositAmount: true,
      status: true,
      createdAt: true,
    },
  });

  if (!order) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ padding: 24, borderRadius: 12, border: '1px solid #ddd', maxWidth: 420 }}>
          <h1>Commande introuvable</h1>
          <p style={{ marginTop: 8 }}>
            Ce lien n’est pas valide ou la commande a été supprimée.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ padding: 24, borderRadius: 12, border: '1px solid #ddd', maxWidth: 420 }}>
        <h1>Confirmation de commande</h1>
        <p style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
          Merci de vérifier les détails avant confirmation.
        </p>

        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 4 }}>Produit</h2>
          <p>{order.productName}</p>
        </div>

        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 4 }}>Montant</h2>
          <p>
            Total : <strong>{order.totalAmount?.toString()} MAD</strong>
          </p>
          <p>
            Acompte : <strong>{order.depositAmount?.toString()} MAD</strong>
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 4 }}>Client</h2>
          <p>{order.customerName}</p>
          <p>{order.customerPhone}</p>
          {order.customerAddress && <p>{order.customerAddress}</p>}
        </div>

        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 4 }}>Statut actuel</h2>
          <p>{order.status}</p>
        </div>

        <ConfirmOrderButton orderId={order.id} initialStatus={order.status} />
      </div>
    </main>
  );
}
