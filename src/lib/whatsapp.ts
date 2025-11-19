const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME ?? 'cod_secure_confirmation';

// conversion très simple Maroc : 06xx → 2126xx
function toInternationalMorocco(msisdn: string): string {
  const digits = msisdn.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '212' + digits.slice(1);
  }
  if (digits.startsWith('212')) {
    return digits;
  }
  // fallback : on considère que c'est déjà en intl
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
    console.warn('WhatsApp non configuré (missing env vars), envoi ignoré.');
    return;
  }

  const to = toInternationalMorocco(payload.customerPhone);

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: WHATSAPP_TEMPLATE_NAME,
      language: { code: 'fr' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: payload.customerName },
            { type: 'text', text: payload.productName },
            { type: 'text', text: `${payload.totalAmount} MAD` },
            { type: 'text', text: payload.confirmUrl },
          ],
        },
      ],
    },
  };

  const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

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
    // on ne throw PAS : l’ordre reste créé, on log juste l’erreur.
  }
}
