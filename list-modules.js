const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');

  const lessons = await db.collection('lessons').find({}).sort({ order: 1 }).toArray();

  for (const lesson of lessons) {
    console.log(`\nLesson ${lesson.order || '?'}: ${lesson.title || lesson.name || 'N/A'} (id: ${lesson._id})`);

    const topicRefs = lesson.topics || [];
    if (topicRefs.length === 0) {
      console.log('  (no topics)');
      continue;
    }

    // Topics can be referenced by ObjectId or by link slug
    const objIds = [];
    const linkSlugs = [];
    for (const ref of topicRefs) {
      const str = ref.toString();
      if (/^[0-9a-f]{24}$/.test(str)) {
        objIds.push(new ObjectId(str));
      } else {
        linkSlugs.push(str);
      }
    }

    let topics = [];
    if (objIds.length > 0) {
      const byId = await db.collection('topics').find({ _id: { $in: objIds } }).toArray();
      topics.push(...byId);
    }
    if (linkSlugs.length > 0) {
      const byLink = await db.collection('topics').find({ link: { $in: linkSlugs } }).toArray();
      topics.push(...byLink);
    }

    // Sort by the order they appear in the lesson's topics array
    const refOrder = {};
    topicRefs.forEach((ref, i) => { refOrder[ref.toString()] = i; });
    topics.sort((a, b) => {
      const aKey = refOrder[a._id.toString()] !== undefined ? refOrder[a._id.toString()] : refOrder[a.link] || 999;
      const bKey = refOrder[b._id.toString()] !== undefined ? refOrder[b._id.toString()] : refOrder[b.link] || 999;
      return aKey - bKey;
    });

    for (const topic of topics) {
      const taskCount = (topic.tasks || []).length;
      console.log(`  ${topic.title || topic.name || topic.link || 'N/A'} | ${taskCount} tasks | id: ${topic._id}`);
    }
  }

  await client.close();
}

main().catch(console.error);
