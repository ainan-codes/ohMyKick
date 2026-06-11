import { getUserByTgId } from './apps/bot/src/db/users.js';

async function main() {
  try {
    const tgId = '7728573771';
    const user = await getUserByTgId(tgId);
    console.log('User state from Supabase:');
    console.log(JSON.stringify(user, null, 2));
  } catch (err) {
    console.error('Error fetching user:', err.message);
  }
}
main();
