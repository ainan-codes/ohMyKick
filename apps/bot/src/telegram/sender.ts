import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';

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
    const photo =
      typeof photoUrlOrBuffer === 'string'
        ? { url: photoUrlOrBuffer }
        : { source: photoUrlOrBuffer, filename: 'poster.png' };

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
