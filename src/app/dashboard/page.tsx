// --- Obligatoire pour éviter le static rendering ---
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";

export default async function DashboardPage() {
  try {
    const cookieStore = cookies();
    const merchantId = cookieStore.get("merchantId")?.value;

    if (!merchantId) {
      return (
        <div style={{ padding: 40 }}>
          <h1>Non autorisé</h1>
          <p>Veuillez vous connecter.</p>
        </div>
      );
    }

    // --- Récupération du marchand ---
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

    // --- Récupération des ordres + confirmations ---
    const orders = await prisma.order.findMany({
      where: { merchantId },
      include: {
        confirmations: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return (
      <div style={{ padding: 40 }}>
        <h1>Dashboard COD-Secure</h1>

        <p>
          Connecté en tant que <strong>{merchant.businessName}</strong>{" "}
          ({merchant.email})
        </p>

        <div style={{ marginTop: 24 }}>
          <a href="/dashboard/create-order">
            <button
              style={{
                padding: 10,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
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
              borderCollapse: "collapse",
              minWidth: 600,
            }}
          >
            <thead>
              <tr>
                <th style={th}>Client</th>
                <th style={th}>Téléphone</th>
                <th style={th}>Produit</th>
                <th style={th}>Montant</th>
                <th style={th}>Statut</th>
                <th style={th}>Dernière confirmation</th>
                <th style={th}>Créé le</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={td}>{o.customerName}</td>
                  <td style={td}>{o.customerPhone}</td>
                  <td style={td}>{o.productName}</td>
                  <td style={td}>{o.totalAmount.toString()} MAD</td>
                  <td style={td}>{o.status}</td>
                  <td style={td}>
                    {o.confirmations.length === 0
                      ? "-"
                      : new Date(
                          o.confirmations[0].createdAt
                        ).toLocaleString()}
                  </td>
                  <td style={td}>{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    return (
      <div style={{ padding: 40 }}>
        <h1>Erreur serveur</h1>
        <p>Une erreur inattendue est survenue.</p>
      </div>
    );
  }
}

const th = {
  borderBottom: "1px solid #ddd",
  padding: 8,
};

const td = {
  borderBottom: "1px solid #eee",
  padding: 8,
};

