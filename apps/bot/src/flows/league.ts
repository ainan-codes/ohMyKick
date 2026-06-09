import { User } from '../db/client.js';
import { supabase } from '../db/client.js';
import { updateConversationState } from '../db/users.js';
import type { BotResponse } from './prediction.js';

export async function handleLeagueMenuRequest(user: User): Promise<BotResponse> {
  const { data: leagues } = await supabase
    .from('friend_league_members')
    .select('league_id, friend_leagues(name)')
    .eq('user_id', user.id);

  let msg = `🏆 *Friend Leagues*\n\n`;
  if (leagues && leagues.length > 0) {
    msg += `You are in the following leagues:\n`;
    leagues.forEach((l: any) => {
      msg += `- ${l.friend_leagues.name}\n`;
    });
  } else {
    msg += `You aren't in any friend leagues yet.\n`;
  }

  msg += `\nWhat would you like to do?`;

  return {
    messages: [{
      kind: 'list',
      text: msg,
      buttonLabel: 'Options',
      sections: [{
        title: 'League Options',
        rows: [
          { id: 'create_league', title: 'Create League', description: 'Start your own league' },
          { id: 'join_league', title: 'Join League', description: 'Join with a code' }
        ]
      }]
    }]
  };
}

export async function handleLeagueAction(user: User, actionId: string): Promise<BotResponse> {
  if (actionId === 'create_league') {
    await updateConversationState(user.id, 'LEAGUE_CREATE_NAME', {
      pending_match_id: null,
      pending_winner: null,
      state_retries: 0
    });
    return {
      messages: [{ kind: 'text', text: 'Enter a name for your new Friend League:' }]
    };
  }

  if (actionId === 'join_league') {
    await updateConversationState(user.id, 'LEAGUE_JOIN_CODE', {
      pending_match_id: null,
      pending_winner: null,
      state_retries: 0
    });
    return {
      messages: [{ kind: 'text', text: 'Enter the join code for the league:' }]
    };
  }

  return handleLeagueMenuRequest(user);
}

export async function handleCreateLeague(user: User, name: string): Promise<BotResponse> {
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const { data, error } = await supabase
    .from('friend_leagues')
    .insert({ name, join_code: joinCode, creator_id: user.id })
    .select('id')
    .single();

  if (error || !data) {
    return {
      messages: [{ kind: 'text', text: '❌ Failed to create league. Try again later.' }]
    };
  }

  // Add user to the league
  await supabase
    .from('friend_league_members')
    .insert({ league_id: data.id, user_id: user.id });

  await updateConversationState(user.id, 'IDLE', {
    pending_match_id: null,
    pending_winner: null,
    state_retries: 0
  });

  return {
    messages: [{ kind: 'text', text: `✅ League *${name}* created!\n\nShare this join code with your friends: *${joinCode}*` }]
  };
}

export async function handleJoinLeague(user: User, code: string): Promise<BotResponse> {
  const { data: league, error } = await supabase
    .from('friend_leagues')
    .select('id, name')
    .eq('join_code', code.toUpperCase())
    .single();

  if (error || !league) {
    await updateConversationState(user.id, 'IDLE', {
      pending_match_id: null,
      pending_winner: null,
      state_retries: 0
    });
    return {
      messages: [{ kind: 'text', text: '❌ Invalid join code. Please try again.' }]
    };
  }

  const { error: joinError } = await supabase
    .from('friend_league_members')
    .insert({ league_id: league.id, user_id: user.id });

  await updateConversationState(user.id, 'IDLE', {
    pending_match_id: null,
    pending_winner: null,
    state_retries: 0
  });

  if (joinError) {
    // If they are already in the league, it will fail the unique constraint
    return {
      messages: [{ kind: 'text', text: `ℹ️ You are already in the *${league.name}* league.` }]
    };
  }

  return {
    messages: [{ kind: 'text', text: `✅ Successfully joined *${league.name}*!` }]
  };
}
