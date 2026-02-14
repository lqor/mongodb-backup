const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const topics = db.collection('topics');
  const lessons = db.collection('lessons');

  // Get URL Encoding topic - full raw document
  const topic = await topics.findOne({ _id: new ObjectId('6970d58b0a6f66b9d8042fd1') });
  console.log('=== URL ENCODING TOPIC (raw) ===');
  console.log(JSON.stringify(topic, null, 2));

  // Get Post Requests lesson - check topics array format
  const lesson = await lessons.findOne({ _id: new ObjectId('6970d1c20a6f66b9d8042fbd') });
  console.log('\n=== POST REQUESTS LESSON ===');
  console.log(`Title: ${lesson.title}`);
  console.log(`Topics array: ${JSON.stringify(lesson.topics)}`);

  await client.close();
}

main().catch(console.error);
