const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

// One from each group
const SAMPLE_IDS = [
  '696ceff3fab54be63ea3d301', // Execute Method task 1 (our migration)
  '696a7eec4d002ca54ab93253', // Schedule Apex from UI
  '696a43627f4abdf9c0dba15c', // Implementing Multiple Interfaces (also has System.debug)
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');

  for (const id of SAMPLE_IDS) {
    const task = await tasks.findOne({ _id: new ObjectId(id) });
    if (!task) { console.log(`${id} NOT FOUND\n`); continue; }

    const deltaText = task.delta && task.delta[0] && task.delta[0].insert ? task.delta[0].insert : '(no delta)';

    console.log('='.repeat(100));
    console.log(`ID: ${id}`);
    console.log(`\n--- DESCRIPTION ---`);
    console.log(task.description);
    console.log(`\n--- DELTA[0].insert ---`);
    console.log(deltaText);
    console.log(`\n--- MATCH? ---`);
    console.log(deltaText.trim() === task.description.trim() ? '✅ MATCH' : '❌ MISMATCH');

    // Show the diff
    if (deltaText.trim() !== task.description.trim()) {
      const descLines = task.description.split('\n');
      const deltaLines = deltaText.split('\n');
      const maxLines = Math.max(descLines.length, deltaLines.length);
      console.log(`\nDescription lines: ${descLines.length}, Delta lines: ${deltaLines.length}`);
      for (let i = 0; i < maxLines; i++) {
        const d = descLines[i] || '(missing)';
        const t = deltaLines[i] || '(missing)';
        if (d !== t) {
          console.log(`\n  Line ${i + 1} DIFFERS:`);
          console.log(`    DESC:  "${d}"`);
          console.log(`    DELTA: "${t}"`);
        }
      }
    }
    console.log('\n');
  }

  await client.close();
}

main().catch(console.error);
