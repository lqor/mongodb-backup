const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const topics = db.collection('topics');
  const lessons = db.collection('lessons');
  const tasks = db.collection('tasks');

  // Find Post Requests lesson
  const lesson = await lessons.findOne({ _id: new ObjectId('6970d1c20a6f66b9d8042fbd') });
  console.log('=== POST REQUESTS LESSON ===');
  console.log(`ID: ${lesson._id}`);
  console.log(`Title: ${lesson.title}`);
  console.log(`Order: ${lesson.order}`);
  console.log(`Topics array: ${JSON.stringify(lesson.topics)}`);
  console.log();

  // Get all topics for this lesson
  const lessonTopics = await topics.find({
    ref: String(lesson._id)
  }).sort({ order: 1 }).toArray();

  console.log(`=== TOPICS (${lessonTopics.length}) ===\n`);
  for (const topic of lessonTopics) {
    const taskCount = await tasks.countDocuments({ ref: String(topic._id), testMode: { $ne: true } });
    console.log(`  Order ${topic.order}: "${topic.topicName}" (${topic._id})`);
    console.log(`    link: ${topic.link}`);
    console.log(`    tasks: ${taskCount}`);
    console.log(`    wpId: ${topic.wpId || 'none'}`);
    console.log();
  }

  // Show full topic document structure for URL Encoding topic
  const urlEncodingTopic = lessonTopics.find(t => t.topicName && t.topicName.toLowerCase().includes('url encoding'));
  if (urlEncodingTopic) {
    console.log('=== URL ENCODING TOPIC (full document) ===');
    console.log(JSON.stringify(urlEncodingTopic, null, 2));
  }

  // Also show the topic right after URL Encoding (if any) to understand ordering
  if (urlEncodingTopic) {
    const nextTopic = lessonTopics.find(t => t.order === urlEncodingTopic.order + 1);
    if (nextTopic) {
      console.log('\n=== NEXT TOPIC AFTER URL ENCODING ===');
      console.log(`  Order ${nextTopic.order}: "${nextTopic.topicName}" (${nextTopic._id})`);
    } else {
      console.log('\n=== URL ENCODING IS THE LAST TOPIC ===');
    }
  }

  await client.close();
}

main().catch(console.error);
