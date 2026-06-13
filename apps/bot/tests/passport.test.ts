import { describe, it, expect } from 'vitest';
import { mapRemoteResponse } from '../src/telegram/handler.js';

describe('Passport photo URL transformation', () => {
  it('resolves relative poster URLs to canonical URL in mapRemoteResponse', () => {
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
          imageUrl: '/api/bot/poster?type=passport&name=Ainan&countryCode=BR&fanId=BR-123456',
        },
      ],
    };

    const result = mapRemoteResponse(apiResponse, 'passport', {});
    const imgMsg = result.messages.find((m) => m.kind === 'image');
    expect(imgMsg).toBeDefined();
    expect(imgMsg?.url).toBe('https://ohmykick.com/api/bot/poster?type=passport&name=Ainan&countryCode=BR&fanId=BR-123456');
  });

  it('filters out echoed profile photos in mapRemoteResponse', () => {
    const apiResponse = {
      sessionState: {
        conversationState: 'IDLE',
      },
      messages: [
        {
          type: 'image',
          imageUrl: 'https://ybkryfliqgfqgjwgniew.supabase.co/storage/v1/object/public/photos/photos/7728573771.jpg',
        },
        {
          type: 'buttons',
          text: '👤 Your Profile',
          buttons: []
        }
      ],
    };

    const result = mapRemoteResponse(apiResponse, 'profile', {});
    const imgMsg = result.messages.find((m) => m.kind === 'image');
    expect(imgMsg).toBeUndefined(); // Ignored photo should be filtered out
    const buttonsMsg = result.messages.find((m) => m.kind === 'buttons');
    expect(buttonsMsg).toBeDefined();
    expect(buttonsMsg?.text).toBe('👤 Your Profile');
  });
});
