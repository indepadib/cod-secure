'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@cod-secure.com');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setResult(`Erreur: ${data.error || 'Login failed'}`);
      } else {
        setResult(`Connecté en tant que ${data.merchant.businessName}`);
        // plus tard: redirect vers /dashboard
      }
    } catch (err: any) {
      setResult('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: 320,
          padding: 24,
          borderRadius: 12,
          border: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <h1 style={{ marginBottom: 8 }}>Connexion marchand</h1>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 8,
            padding: 10,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
        {result && (
          <p style={{ marginTop: 8, fontSize: 14 }}>
            {result}
          </p>
        )}
      </form>
    </main>
  );
}
