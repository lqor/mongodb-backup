const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');

  const taskId = new ObjectId('6679674fb22733d50c313445');

  // ========== PRE-FLIGHT ==========
  console.log('========== PRE-FLIGHT ==========\n');

  const task = await db.collection('tasks').findOne({ _id: taskId });
  if (!task) { console.log('Task not found!'); await client.close(); return; }
  console.log('Task found:', task.description.substring(0, 80));
  console.log('Req count:', task.requirements.length, '| Test count:', task.tests.length);

  // Count occurrences of the misspelling
  const misspelledInSolution = (task.solution.match(/foodOccurences/g) || []).length;
  const misspelledInReqs = task.requirements.filter(r => r.includes('foodOccurences')).length;
  const misspelledInTests = task.tests.filter(t => t.includes('foodOccurences')).length;
  console.log('Misspelled in solution:', misspelledInSolution);
  console.log('Misspelled in requirements:', misspelledInReqs);
  console.log('Misspelled in tests:', misspelledInTests);

  // ========== FIX ==========
  console.log('\n========== APPLYING FIXES ==========\n');

  const newSolution = task.solution.replace(/foodOccurences/g, 'foodOccurrences');
  const newRequirements = task.requirements.map(r => r.replace(/foodOccurences/g, 'foodOccurrences'));
  const newTests = task.tests.map(t => t.replace(/foodOccurences/g, 'foodOccurrences'));

  // Description already uses foodOccurrences (correct), just sync delta
  const newDelta = [{ insert: task.description + '\n' }];

  // Verify no System.debug
  if (newSolution.includes('System.debug')) {
    console.log('❌ Solution has System.debug!'); await client.close(); return;
  }

  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    {
      $set: {
        solution: newSolution,
        requirements: newRequirements,
        tests: newTests,
        delta: newDelta
      }
    }
  );
  console.log('Updated:', result.modifiedCount === 1 ? '✅' : '❌');

  // ========== VERIFICATION ==========
  console.log('\n========== VERIFICATION ==========\n');

  const updated = await db.collection('tasks').findOne({ _id: taskId });

  // Check no misspelling remains anywhere
  const allText = updated.solution + JSON.stringify(updated.requirements) + JSON.stringify(updated.tests);
  const stillMisspelled = allText.includes('foodOccurences');
  console.log('No misspelling remaining:', !stillMisspelled ? '✅' : '❌');
  console.log('Correct spelling in solution:', updated.solution.includes('foodOccurrences') ? '✅' : '❌');
  console.log('Correct spelling in reqs:', updated.requirements.some(r => r.includes('foodOccurrences')) ? '✅' : '❌');
  console.log('Correct spelling in tests:', updated.tests.some(t => t.includes('foodOccurrences')) ? '✅' : '❌');
  console.log('Delta synced:', updated.delta[0].insert === updated.description + '\n' ? '✅' : '❌');
  console.log('Req count = Test count:', updated.requirements.length === updated.tests.length ? '✅' : '❌',
    `(${updated.requirements.length}/${updated.tests.length})`);
  console.log('No System.debug:', !updated.solution.includes('System.debug') ? '✅' : '❌');

  console.log('\nDone!');
  await client.close();
}

main().catch(console.error);
