const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const topics = db.collection('topics');

  // Find topics with wp_id to understand the pattern
  const withWpId = await topics.find({ wp_id: { $exists: true, $ne: null } }).limit(10).toArray();
  console.log(`Topics with wp_id (sample of ${withWpId.length}):\n`);
  for (const t of withWpId) {
    console.log(`  "${t.topicName}" | wp_id: ${t.wp_id} | link: ${t.link} | order: ${t.order}`);
  }

  await client.close();
}

main().catch(console.error);
