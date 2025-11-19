const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TEMPLATE_NAME =
  process.env.WHATSAPP_TEMPLATE_NAME ?? 'hello_world';

// Conversion rapide pour numéros marocains (ou autres)
// 06xx → 2126xx, 07xx → 2127xx, etc.
function toInternationalMsisdn(msisdn: string): string {
  const digits = msisdn.replace(/\D/g, '');

  if (digits.startsWith('0')) {
    // suppose que c'est un numéro marocain local
    return '212' + digits.slice(1);
  }
  if (digits.startsWith('212')) {
    return digits;
  }
  // fallback : déjà en format international
  return digits;
}

type WhatsappOrderPayload = {
  customerName: string;
  customerPhone: string;
  productName: string;
  totalAmount: string | number;
  confirmUrl: string;
};

export async function sendOrderConfirmationWhatsApp(
  payload: WhatsappOrderPayload
): Promise<void> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn(
      'WhatsApp non configuré (WHATSAPP_TOKEN ou PHONE_NUMBER_ID manquant), envoi ignoré.'
    );
    return;
  }

  const to = toInternationalMsisdn(payload.customerPhone);

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: WHATSAPP_TEMPLATE_NAME,
      language: { code: 'en_US' }, // pour hello_world
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: payload.customerName || 'client' },
          ],
        },
      ],
    },
  };

  const url = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.error('Erreur envoi WhatsApp', res.status, txt);
    // On ne throw pas : on ne casse pas le flux métier
  }
}
