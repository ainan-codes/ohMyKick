const { posterQueue } = require('../apps/bot/dist/queues/queue.js');

async function test() {
  await posterQueue.add('prematch-poster', {
    type: 'prematch',
    userId: '2fcd0333-5bf0-417f-9bec-7587424029fb',
    matchId: '13a4087e-df72-4632-a521-39659dc6ed18',
    predictionId: 'test-123'
  });
  console.log('Added to queue');
}

test().catch(console.error);
