import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN ?? '';
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID ?? '';
const WA_API_BASE = `https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`;

function waHeaders() {
  return {
    Authorization: `Bearer ${WA_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

export async function sendWhatsAppText(to: string, text: string): Promise<void> {
  try {
    await axios.post(
      WA_API_BASE,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text, preview_url: false },
      },
      { headers: waHeaders() }
    );
  } catch (err: any) {
    console.error('[WA sendText]', err?.response?.data ?? err.message);
  }
}

export async function sendWhatsAppButtons(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
): Promise<void> {
  try {
    await axios.post(
      WA_API_BASE,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: {
            buttons: buttons.map((b) => ({
              type: 'reply',
              reply: { id: b.id, title: b.title.slice(0, 20) },
            })),
          },
        },
      },
      { headers: waHeaders() }
    );
  } catch (err: any) {
    console.error('[WA sendButtons]', err?.response?.data ?? err.message);
  }
}

export async function sendWhatsAppList(
  to: string,
  bodyText: string,
  buttonLabel: string,
  sections: { title: string; rows: { id: string; title: string; description?: string }[] }[]
): Promise<void> {
  try {
    await axios.post(
      WA_API_BASE,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: { text: bodyText },
          action: {
            button: buttonLabel.slice(0, 20),
            sections: sections.map((s) => ({
              title: s.title.slice(0, 24),
              rows: s.rows.map((r) => ({
                id: r.id.slice(0, 200),
                title: r.title.slice(0, 24),
                description: r.description?.slice(0, 72) ?? '',
              })),
            })),
          },
        },
      },
      { headers: waHeaders() }
    );
  } catch (err: any) {
    console.error('[WA sendList]', err?.response?.data ?? err.message);
  }
}

export async function sendWhatsAppImage(
  to: string,
  imageUrl: string,
  caption?: string
): Promise<void> {
  try {
    await axios.post(
      WA_API_BASE,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'image',
        image: {
          link: imageUrl,
          caption: caption?.slice(0, 1024) ?? '',
        },
      },
      { headers: waHeaders() }
    );
  } catch (err: any) {
    console.error('[WA sendImage]', err?.response?.data ?? err.message);
  }
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  parameters: string[],
  languageCode = 'en'
): Promise<void> {
  try {
    await axios.post(
      WA_API_BASE,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [
            {
              type: 'body',
              parameters: parameters.map((p) => ({ type: 'text', text: p })),
            },
          ],
        },
      },
      { headers: waHeaders() }
    );
  } catch (err: any) {
    console.error('[WA sendTemplate]', err?.response?.data ?? err.message);
  }
}

export async function downloadWhatsAppMedia(mediaId: string): Promise<Buffer | null> {
  try {
    const urlResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${mediaId}`,
      { headers: { Authorization: `Bearer ${WA_TOKEN}` } }
    );
    const mediaUrl = urlResponse.data.url;

    const mediaResponse = await axios.get(mediaUrl, {
      headers: { Authorization: `Bearer ${WA_TOKEN}` },
      responseType: 'arraybuffer',
    });

    return Buffer.from(mediaResponse.data);
  } catch (err: any) {
    console.error('[WA downloadMedia]', err.message);
    return null;
  }
}

/** Extract message payload from WhatsApp webhook body */
export function extractWhatsAppMessage(body: any): {
  waId: string;
  messageType: string;
  text: string;
  buttonReplyId: string;
  listReplyId: string;
  hasImage: boolean;
  imageId: string | null;
  timestamp: Date;
} | null {
  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return null;

  return {
    waId: message.from,
    messageType: message.type,
    text: message.text?.body ?? '',
    buttonReplyId: message.interactive?.button_reply?.id ?? '',
    listReplyId: message.interactive?.list_reply?.id ?? '',
    hasImage: message.type === 'image',
    imageId: message.image?.id ?? null,
    timestamp: new Date(parseInt(message.timestamp, 10) * 1000),
  };
}
