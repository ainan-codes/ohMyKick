import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';

export const bot = new Telegraf(TG_TOKEN);

export async function sendTgText(chatId: number | string, text: string): Promise<void> {
  try {
    await bot.telegram.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  } catch (err: any) {
    console.error('[TG sendText]', err.message);
  }
}

export async function sendTgButtons(
  chatId: number | string,
  text: string,
  buttons: { id: string; label: string }[],
  columns = 3
): Promise<void> {
  try {
    // Chunk buttons into rows
    const rows: { id: string; label: string }[][] = [];
    for (let i = 0; i < buttons.length; i += columns) {
      rows.push(buttons.slice(i, i + columns));
    }

    const keyboard = Markup.inlineKeyboard(
      rows.map((row) =>
        row.map((b) => Markup.button.callback(b.label, b.id))
      )
    );

    await bot.telegram.sendMessage(chatId, text, {
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
  buttons?: { id: string; label: string }[][]
): Promise<void> {
  try {
    const photo =
      typeof photoUrlOrBuffer === 'string'
        ? { url: photoUrlOrBuffer }
        : { source: photoUrlOrBuffer, filename: 'poster.png' };

    const replyMarkup = buttons
      ? Markup.inlineKeyboard(
          buttons.map((row) => row.map((b) => Markup.button.callback(b.label, b.id)))
        ).reply_markup
      : undefined;

    await bot.telegram.sendPhoto(chatId, photo as any, {
      caption: caption?.slice(0, 1024),
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
