import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';

export const bot = new Telegraf(TG_TOKEN);

export function escapeMarkdown(text: string): string {
  if (!text) return text;
  // Escape underscores that are part of words (e.g. GB_SCT -> GB\_SCT) to prevent Markdown parser failures
  return text.replace(/([a-zA-Z0-9])_([a-zA-Z0-9])/g, '$1\\_$2');
}

export async function sendTgText(chatId: number | string, text: string): Promise<void> {
  try {
    await bot.telegram.sendMessage(chatId, escapeMarkdown(text), { parse_mode: 'Markdown' });
  } catch (err: any) {
    console.error('[TG sendText]', err.message);
  }
}

export function normalizeButtons(buttons: any, columns = 3): { id: string; label: string }[][] {
  if (!buttons || !Array.isArray(buttons)) return [];

  const rows: { id: string; label: string }[][] = [];
  let currentChunk: { id: string; label: string }[] = [];

  for (const item of buttons) {
    if (Array.isArray(item)) {
      if (currentChunk.length > 0) {
        rows.push(currentChunk);
        currentChunk = [];
      }
      const filteredRow = item
        .filter((b: any) => b && typeof b === 'object' && b.id && (b.label || b.title))
        .map((b: any) => ({ id: b.id, label: String(b.label || b.title) }));
      if (filteredRow.length > 0) {
        rows.push(filteredRow);
      }
    } else if (item && typeof item === 'object') {
      const id = item.id;
      const label = item.label || item.title;
      if (id && label) {
        currentChunk.push({ id, label: String(label) });
        if (currentChunk.length === columns) {
          rows.push(currentChunk);
          currentChunk = [];
        }
      }
    }
  }

  if (currentChunk.length > 0) {
    rows.push(currentChunk);
  }

  return rows;
}

export async function sendTgButtons(
  chatId: number | string,
  text: string,
  buttons: any,
  columns = 3
): Promise<void> {
  try {
    const rows = normalizeButtons(buttons, columns);
    const keyboard = Markup.inlineKeyboard(
      rows.map((row) =>
        row.map((b) => Markup.button.callback(b.label, b.id))
      )
    );

    await bot.telegram.sendMessage(chatId, escapeMarkdown(text), {
      parse_mode: 'Markdown',
      reply_markup: keyboard.reply_markup,
    });
  } catch (err: any) {
    console.error('[TG sendButtons]', err.message);
  }
}

export async function sendTgPhoto(
  chatId: number | string,
  photoUrlOrBuffer: string | Buffer,
  caption?: string,
  buttons?: any
): Promise<void> {
  try {
    let finalPhoto = photoUrlOrBuffer;

    if (typeof photoUrlOrBuffer === 'string' && photoUrlOrBuffer.startsWith('http')) {
      try {
        const url = new URL(photoUrlOrBuffer);
        const isPassport = url.pathname.includes('/api/bot/poster') && url.searchParams.get('type') === 'passport';
        const photoUrlParam = url.searchParams.get('photoUrl');

        if (isPassport && photoUrlParam) {
          console.log(`[TG sendPhoto] Intercepting passport image for composite. Photo URL: ${photoUrlParam}`);
          const [passportRes, photoRes] = await Promise.all([
            fetch(photoUrlOrBuffer),
            fetch(photoUrlParam),
          ]);

          if (passportRes.ok && photoRes.ok) {
            const passportBuf = Buffer.from(await passportRes.arrayBuffer());
            const photoBuf = Buffer.from(await photoRes.arrayBuffer());

            const meta = await sharp(passportBuf).metadata();
            const W = meta.width || 540;
            const scale = W / 540;

            const cx = Math.round(270 * scale);
            const cy = Math.round(258 * scale);
            const r = Math.round(122 * scale);
            const size = r * 2;

            const circleSvg = Buffer.from(
              `<svg width="${size}" height="${size}">
                <circle cx="${r}" cy="${r}" r="${r}" fill="white"/>
              </svg>`
            );

            const croppedPhoto = await sharp(photoBuf)
              .resize(size, size, { fit: 'cover' })
              .composite([{
                input: circleSvg,
                blend: 'dest-in'
              }])
              .png()
              .toBuffer();

            finalPhoto = await sharp(passportBuf)
              .composite([{
                input: croppedPhoto,
                top: cy - r,
                left: cx - r,
              }])
              .png()
              .toBuffer();

            console.log(`[TG sendPhoto] Composite successful. Size: ${finalPhoto.length} bytes`);
          } else {
            console.warn(`[TG sendPhoto] Fetch template/photo failed. Passport: ${passportRes.status}, Photo: ${photoRes.status}. Falling back to URL.`);
          }
        }
      } catch (err: any) {
        console.error(`[TG sendPhoto] Failed to composite passport image: ${err.message}. Falling back to original URL.`);
      }
    }

    const photo =
      typeof finalPhoto === 'string'
        ? { url: finalPhoto }
        : { source: finalPhoto, filename: 'poster.png' };

    const rows = buttons ? normalizeButtons(buttons, 3) : [];
    const replyMarkup = rows.length > 0
      ? Markup.inlineKeyboard(
          rows.map((row) => row.map((b) => Markup.button.callback(b.label, b.id)))
        ).reply_markup
      : undefined;

    await bot.telegram.sendPhoto(chatId, photo as any, {
      caption: caption ? escapeMarkdown(caption).slice(0, 1024) : undefined,
      parse_mode: 'Markdown',
      reply_markup: replyMarkup,
    });
  } catch (err: any) {
    console.error('[TG sendPhoto]', err.message);
  }
}

export async function answerCallbackQuery(callbackQueryId: string): Promise<void> {
  try {
    await bot.telegram.answerCbQuery(callbackQueryId);
  } catch {
    // Ignore — may have already expired
  }
}
