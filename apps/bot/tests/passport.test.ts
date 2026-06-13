import { describe, it, expect, vi } from 'vitest';
import { buildPassportUrl, mapRemoteResponse } from '../src/telegram/handler.js';

describe('Passport photo URL transformation', () => {
  it('builds Vercel passport URL with all fields correctly', () => {
    const sessionState = {
      userName: 'Ainan',
      countryCode: 'BR',
      countryName: 'Brazil',
      countryFlag: '🇧🇷',
      fanId: 'BR-123456',
      fanLevel: 'SUPER FAN',
      totalPoints: 120,
      referralCount: 2,
      referralCode: 'REFCODE',
      passportVariant: 2,
      photoUrl: 'https://supabase.co/photo.jpg',
    };

    const url = buildPassportUrl(sessionState);
    expect(url).toContain('https://ohmykick.vercel.app/api/posters/passport');
    expect(url).toContain('name=Ainan');
    expect(url).toContain('countryCode=BR');
    expect(url).toContain('fanId=BR-123456');
    expect(url).toContain('photoUrl=https%3A%2F%2Fsupabase.co%2Fphoto.jpg');
    expect(url).toContain('variant=V2');
  });

  it('replaces mock-poster passport URL with Vercel URL in mapRemoteResponse when photoUrl is present', () => {
    const apiResponse = {
      sessionState: {
        conversationState: 'IDLE',
        userName: 'Ainan',
        countryCode: 'BR',
        fanId: 'BR-123456',
      },
      messages: [
        {
          type: 'image',
          imageUrl: '/api/bot/mock-poster?type=passport&name=Ainan&countryCode=BR&fanId=BR-123456',
        },
      ],
    };

    const userSessionState = {
      photoUrl: 'https://supabase.co/photo.jpg',
    };

    const result = mapRemoteResponse(apiResponse, 'passport', userSessionState);
    const imgMsg = result.messages.find((m) => m.kind === 'image');
    expect(imgMsg).toBeDefined();
    expect(imgMsg?.url).toContain('https://ohmykick.vercel.app/api/posters/passport');
    expect(imgMsg?.url).toContain('photoUrl=https%3A%2F%2Fsupabase.co%2Fphoto.jpg');
  });

  it('replaces mock-poster passport URL with Vercel URL even if photoUrl is missing', () => {
    const apiResponse = {
      sessionState: {
        conversationState: 'IDLE',
      },
      messages: [
        {
          type: 'image',
          imageUrl: '/api/bot/mock-poster?type=passport&name=Ainan',
        },
      ],
    };

    const result = mapRemoteResponse(apiResponse, 'passport', {});
    const imgMsg = result.messages.find((m) => m.kind === 'image');
    expect(imgMsg).toBeDefined();
    expect(imgMsg?.url).toContain('https://ohmykick.vercel.app/api/posters/passport');
    expect(imgMsg?.url).not.toContain('photoUrl');
  });
});
