const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');

  const lessonNames = ['Logging in Integrations', 'Events & Signing'];

  for (const name of lessonNames) {
    const lesson = await db.collection('lessons').findOne({ title: name });
    if (!lesson) { console.log('Lesson not found:', name); continue; }

    console.log('\n=== LESSON:', lesson.title, '(order:', lesson.order, ', id:', lesson._id.toString(), ') ===');
    console.log('Topic slugs:', lesson.topics);

    if (lesson.topics && lesson.topics.length > 0) {
      for (const slug of lesson.topics) {
        // Topics are stored as link slugs in the lesson
        const topic = await db.collection('topics').findOne({ link: slug });
        if (topic) {
          const taskCount = topic.tasks ? topic.tasks.length : 0;
          console.log('  Topic:', topic.title, '| link:', topic.link, '| tasks:', taskCount, '| id:', topic._id.toString());
          if (taskCount > 0) {
            // Check task ID types
            const sampleType = typeof topic.tasks[0] === 'string' ? 'string' : (topic.tasks[0] instanceof ObjectId ? 'ObjectId' : typeof topic.tasks[0]);
            console.log('    Task ID type:', sampleType);
            console.log('    IDs:', JSON.stringify(topic.tasks.map(t => t.toString())));
          }
        } else {
          console.log('  Topic NOT FOUND for slug:', slug);
        }
      }
    }
  }

  // Also check other integration lessons
  const otherNames = ['First Callout', 'Post Requests', 'Requests from Triggers', 'Testing Integrations', 'Authentication', 'Webhooks', 'Integration Architect Preparation'];
  console.log('\n\n=== OTHER INTEGRATION LESSONS ===');
  for (const name of otherNames) {
    const lesson = await db.collection('lessons').findOne({ title: name });
    if (!lesson) continue;
    let totalTasks = 0;
    if (lesson.topics) {
      for (const slug of lesson.topics) {
        const topic = await db.collection('topics').findOne({ link: slug });
        if (topic && topic.tasks) totalTasks += topic.tasks.length;
      }
    }
    console.log(name, '(order', lesson.order + ') — topics:', lesson.topics ? lesson.topics.length : 0, ', total tasks:', totalTasks);
  }

  await client.close();
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
