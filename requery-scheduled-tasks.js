const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');

  const ids = [
    '696cfb3dfab54be63ea3d31a', // InactiveAccountBatch + Scheduler
    '696cfb3dfab54be63ea3d31d', // CaseEscalationBatch + Scheduler
    '696cfb3dfab54be63ea3d31e', // ContactTitleUpdateBatch + Scheduler
  ];

  for (const id of ids) {
    const task = await tasks.findOne({ _id: new ObjectId(id) });
    if (task) {
      console.log('='.repeat(100));
      console.log(`ID: ${task._id}`);
      console.log(`Description: ${task.description}`);
      console.log(`orgCode: ${task.orgCode}`);
      console.log(`testMode: ${task.testMode}`);
      console.log(`Requirements (${task.requirements.length}):`);
      task.requirements.forEach((r, i) => console.log(`  ${i+1}. ${r}`));
      console.log(`Tests (${task.tests.length}):`);
      task.tests.forEach((t, i) => console.log(`  ${i+1}. ${t}`));
      console.log(`Solution:\n${task.solution}`);
      console.log(`Template: ${task.template}`);
      console.log(`Delta: ${JSON.stringify(task.delta)}`);
      console.log();
    } else {
      console.log(`Task ${id} NOT FOUND (deleted?)`);
    }
  }

  await client.close();
}

main().catch(console.error);
