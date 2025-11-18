'use client';

import { useState } from 'react';

export default function CreateOrderPage() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          productName,
          price: Number(price),
        }),
      });

      const data = await res.json();
      setResult(data);

      if (data.ok) {
        setCustomerName('');
        setCustomerPhone('');
        setProductName('');
        setPrice('');
      }
    } catch (err) {
      setResult({ ok: false, error: 'Erreur réseau' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Créer un ordre COD</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400, marginTop: 20 }}
      >
        <input
          placeholder="Nom du client"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          placeholder="Téléphone du client"
          value={customerPhone}
          onChange={e => setCustomerPhone(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          placeholder="Produit"
          value={productName}
          onChange={e => setProductName(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          placeholder="Prix (MAD)"
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          style={{ padding: 8 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: 10, padding: 10, borderRadius: 8, border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Création…' : 'Créer l’ordre'}
        </button>
      </form>

      {result && (
        <pre style={{ marginTop: 20, background: '#f5f5f5', padding: 10 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
