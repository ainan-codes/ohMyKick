import { supabase, Match } from './client.js';

export async function getUpcomingMatches(limitHours = 24): Promise<Match[]> {
  const now = new Date();
  const future = new Date(now.getTime() + limitHours * 60 * 60 * 1000);

  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'SCHEDULED')
    .eq('prediction_open', true)
    .gte('kickoff_at', now.toISOString())
    .lte('kickoff_at', future.toISOString())
    .order('kickoff_at', { ascending: true });

  return data ?? [];
}

export async function getNextMatch(): Promise<Match | null> {
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'SCHEDULED')
    .eq('prediction_open', true)
    .gt('kickoff_at', new Date().toISOString())
    .order('kickoff_at', { ascending: true })
    .limit(1)
    .single();

  return data;
}

export async function getMatchById(id: string): Promise<Match | null> {
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

export async function getMatchByApiId(apiMatchId: number): Promise<Match | null> {
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('api_match_id', apiMatchId)
    .single();
  return data;
}

export async function getActiveMatches(): Promise<Match[]> {
  const now = new Date();
  const twoHoursFuture = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const fourHoursPast = new Date(now.getTime() - 4 * 60 * 60 * 1000);

  const { data } = await supabase
    .from('matches')
    .select('*')
    .in('status', ['SCHEDULED', 'LIVE'])
    .lt('kickoff_at', twoHoursFuture.toISOString())
    .gt('kickoff_at', fourHoursPast.toISOString());

  return data ?? [];
}

export async function updateMatchStatus(
  id: string,
  updates: Partial<Pick<Match, 'status' | 'home_score' | 'away_score' | 'prediction_open'>>
): Promise<void> {
  await supabase
    .from('matches')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function upsertMatch(matchData: {
  api_match_id: number;
  home_team: string;
  away_team: string;
  home_country_code?: string;
  away_country_code?: string;
  home_flag_emoji?: string;
  away_flag_emoji?: string;
  kickoff_at: string;
  kickoff_local_ist?: string;
  stage: string;
  venue?: string;
  status?: string;
}): Promise<void> {
  await supabase.from('matches').upsert(matchData, { onConflict: 'api_match_id' });
}

export function formatMatchForDisplay(match: Match): string {
  return `${match.home_flag_emoji ?? ''} ${match.home_team} vs ${match.away_team} ${match.away_flag_emoji ?? ''}`;
}

export function formatKickoffTime(match: Match): string {
  if (match.kickoff_local_ist) return match.kickoff_local_ist;
  const d = new Date(match.kickoff_at);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }) + ' IST';
}
