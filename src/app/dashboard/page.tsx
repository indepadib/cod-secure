'use client';

import { useEffect, useState } from 'react';

type Merchant = {
  id: string;
  email: string;
  businessName: string;
};

type OrderWithConfirmation = {
  id: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  confirmations?: { createdAt: string }[];
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [orders, setOrders] = useState<OrderWithConfirmation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();

        if (!res.ok || !data.ok) {
          setError(data.error || 'Erreur de chargement');
        } else {
          setMerchant(data.merchant);
          setOrders(data.orders || []);
        }
      } catch (e) {
        setError('Erreur réseau');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Dashboard COD-Secure</h1>
        <p>Chargement…</p>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Non autorisé</h1>
        <p>Veuillez vous connecter.</p>
        {error && <p style={{ marginTop: 12, color: 'red' }}>{error}</p>}
      </div>
    );
  }

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
        <table style={{ marginTop: 16, borderCollapse: 'collapse', minWidth: 800 }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Client</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Téléphone</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Produit</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Prix</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Statut</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Confirmée le</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Créé le</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Lien public</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const lastConfirmation = o.confirmations?.[0] ?? null;

              return (
                <tr key={o.id}>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{o.customerName}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{o.customerPhone}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{o.productName}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{o.totalAmount} MAD</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{o.status}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                    {lastConfirmation
                      ? new Date(lastConfirmation.createdAt).toLocaleString()
                      : '-'}
                  </td>
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
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

