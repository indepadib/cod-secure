'use client';

import { useState } from 'react';

export default function CreateOrderPage() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit(e: any) {
    e.preventDefault();

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
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 40 }}>
      <h1>Créer un ordre COD</h1>

      <input placeholder="Nom client" value={customerName} onChange={e => setCustomerName(e.target.value)} />
      <input placeholder="Téléphone client" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
      <input placeholder="Produit" value={productName} onChange={e => setProductName(e.target.value)} />
      <input placeholder="Prix" value={price} onChange={e => setPrice(e.target.value)} />

      <button type="submit">Créer</button>

      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </form>
  );
}
