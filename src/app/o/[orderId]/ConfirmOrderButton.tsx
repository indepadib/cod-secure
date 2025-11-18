'use client';

import { useState } from 'react';

export default function ConfirmOrderButton(props: { orderId: string; initialStatus: string }) {
  const { orderId, initialStatus } = props;
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMessage(data.error || 'Erreur lors de la confirmation');
        return;
      }

      setStatus(data.order.status);
      setMessage('Votre commande est confirmée. Merci !');
    } catch (e) {
      setMessage('Erreur réseau, veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || status === 'CONFIRMED';

  return (
    <div style={{ marginTop: 24 }}>
      <button
        disabled={disabled}
        onClick={handleClick}
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 8,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {status === 'CONFIRMED'
          ? 'Commande déjà confirmée ✅'
          : loading
          ? 'Confirmation en cours…'
          : 'Je confirme ma commande'}
      </button>
      {message && (
        <p style={{ marginTop: 8, fontSize: 14 }}>
          {message}
        </p>
      )}
    </div>
  );
}
