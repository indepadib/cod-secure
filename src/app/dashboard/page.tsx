'use client';

import { useEffect, useState } from 'react';

type Merchant = {
  id: string;
  email: string;
  businessName: string;
};

type Confirmation = {
  createdAt: string;
};

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  totalAmount: string | number;
  status: string;
  createdAt: string;
  updatedAt: string;
};


export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();

        if (!res.ok || !data.ok) {
          setError(data.error || 'Erreur de chargement');
          setMerchant(null);
          setOrders([]);
        } else {
          setMerchant(data.merchant);
          setOrders(data.orders || []);
          setError(null);
        }
      } catch (e) {
        setError('Erreur réseau');
        setMerchant(null);
        setOrders([]);
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
        {error && (
          <p style={{ marginTop: 12, color: 'red', whiteSpace: 'pre-wrap' }}>
            {error}
          </p>
        )}
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
          <button
            style={{
              padding: 10,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Créer un ordre COD
          </button>
        </a>
      </div>

      <h2 style={{ marginTop: 32 }}>Vos ordres COD</h2>

      {orders.length === 0 && <p>Aucun ordre pour le moment.</p>}

      {orders.length > 0 && (
        <table
          style={{
            marginTop: 16,
            borderCollapse: 'collapse',
            minWidth: 800,
          }}
        >
          <thead>
            <tr>
              <th style={th}>Client</th>
              <th style={th}>Téléphone</th>
              <th style={th}>Produit</th>
              <th style={th}>Montant</th>
              <th style={th}>Statut</th>
              <th style={th}>Confirmée le</th>
              <th style={th}>Créé le</th>
              <th style={th}>Lien public</th>
            </tr>
          </thead>
         <tbody>
  {orders.map((o) => (
    <tr key={o.id}>
      <td style={td}>{o.customerName}</td>
      <td style={td}>{o.customerPhone}</td>
      <td style={td}>{o.productName}</td>
      <td style={td}>{String(o.totalAmount)} MAD</td>
      <td style={td}>{o.status}</td>
      <td style={td}>
        {o.status === 'CONFIRMED'
          ? new Date(o.updatedAt).toLocaleString()
          : '-'}
      </td>
      <td style={td}>{new Date(o.createdAt).toLocaleString()}</td>
      <td style={td}>
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

const th: React.CSSProperties = {
  borderBottom: '1px solid #ddd',
  padding: 8,
};

const td: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: 8,
};

