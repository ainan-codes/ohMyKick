import axios from 'axios';
import dotenv from 'dotenv';
import { getActiveMatches, updateMatchStatus } from '../db/matches.js';
import { lockMatchPredictions } from '../db/predictions.js';
import { processMatchResult } from './results.js';

dotenv.config();

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY ?? '';
const API_FOOTBALL_HOST = process.env.API_FOOTBALL_HOST ?? 'v3.football.api-sports.io';
const IS_MOCK = !API_FOOTBALL_KEY || process.env.NODE_ENV === 'development';

// api-sports.io direct API uses x-apisports-key header (NOT RapidAPI)
const API_BASE_URL = `https://${API_FOOTBALL_HOST}`;

export async function pollActiveMatches(): Promise<void> {
  if (IS_MOCK) {
    console.log('[Poll] Running in MOCK mode — no live API calls');
    return;
  }

  const matches = await getActiveMatches();
  if (matches.length === 0) {
    console.log('[Poll] No active matches to poll');
    return;
  }

  console.log(`[Poll] Polling ${matches.length} active match(es)`);

  for (const match of matches) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/fixtures?id=${match.api_match_id}`,
        {
          headers: {
            'x-apisports-key': API_FOOTBALL_KEY,
          },
          timeout: 10000,
        }
      );

      const fixture = response.data?.response?.[0];
      if (!fixture) continue;

      const apiStatus = fixture.fixture.status.short;
      console.log(`[Poll] Match ${match.home_team} vs ${match.away_team} — Status: ${apiStatus}`);

      // Lock predictions at kickoff
      const LIVE_STATUSES = ['1H', 'HT', '2H', 'ET', 'PEN'];
      if (LIVE_STATUSES.includes(apiStatus) && match.prediction_open) {
        await updateMatchStatus(match.id, { status: 'LIVE', prediction_open: false });
        await lockMatchPredictions(match.id);
        console.log(`[Poll] Predictions locked for ${match.home_team} vs ${match.away_team}`);
      }


      // Match finished — trigger result pipeline
      const FINISHED_STATUSES = ['FT', 'AET', 'P'];
      if (FINISHED_STATUSES.includes(apiStatus) && match.status !== 'FINISHED') {
        const homeScore = fixture.goals.home ?? 0;
        const awayScore = fixture.goals.away ?? 0;

        await updateMatchStatus(match.id, {
          status: 'FINISHED',
          home_score: homeScore,
          away_score: awayScore,
          prediction_open: false,
        });

        console.log(`[Poll] Match finished: ${match.home_team} ${homeScore}-${awayScore} ${match.away_team}`);
        await processMatchResult(match.id, homeScore, awayScore);
      }
    } catch (err: any) {
      console.error(`[Poll] Error polling match ${match.id}:`, err.message);
    }
  }
}

/**
 * Simulate a match result — used in local development / testing
 */
export async function mockMatchFinished(
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<void> {
  await updateMatchStatus(matchId, {
    status: 'FINISHED',
    home_score: homeScore,
    away_score: awayScore,
    prediction_open: false,
  });
  await processMatchResult(matchId, homeScore, awayScore);
  console.log(`[Mock] Match ${matchId} finished: ${homeScore}-${awayScore}`);
}
