const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const topics = db.collection('topics');
  const lessons = db.collection('lessons');

  const LESSON_ID = '6970d1c20a6f66b9d8042fbd'; // Post Requests lesson

  // ========== PRE-FLIGHT CHECKS ==========
  console.log('========== PRE-FLIGHT CHECKS ==========\n');

  // 1. Verify Post Requests lesson exists
  const lesson = await lessons.findOne({ _id: new ObjectId(LESSON_ID) });
  if (!lesson) {
    console.log('❌ Post Requests lesson not found!');
    await client.close();
    return;
  }
  console.log(`✅ Lesson found: "${lesson.title}"`);
  console.log(`   Current topics count: ${lesson.topics.length}`);
  console.log(`   Last topic slug: "${lesson.topics[lesson.topics.length - 1]}"`);

  // 2. Verify the slug doesn't already exist
  if (lesson.topics.includes('pokemon-api')) {
    console.log('❌ "pokemon-api" slug already in lesson topics array!');
    await client.close();
    return;
  }
  console.log('✅ "pokemon-api" slug not yet in lesson topics array');

  // 3. Verify no topic with this wp_id already exists
  const existing = await topics.findOne({ wp_id: '10540' });
  if (existing) {
    console.log(`❌ Topic with wp_id "10540" already exists: "${existing.topicName}" (${existing._id})`);
    await client.close();
    return;
  }
  console.log('✅ No topic with wp_id "10540" exists yet');

  // 4. Verify order 13 doesn't exist for this lesson
  const orderConflict = await topics.findOne({ ref: LESSON_ID, order: 13 });
  if (orderConflict) {
    console.log(`❌ Topic with order 13 already exists: "${orderConflict.topicName}"`);
    await client.close();
    return;
  }
  console.log('✅ No topic with order 13 exists for this lesson');

  // ========== INSERT TOPIC ==========
  console.log('\n========== INSERTING TOPIC ==========\n');

  const newTopic = {
    topicName: 'Working with the Pokemon API',
    link: 'pokemon-api',
    wp_id: '10540',
    order: 13,
    ref: LESSON_ID,
    tasks: []
  };

  console.log('Topic to insert:');
  console.log(JSON.stringify(newTopic, null, 2));

  const insertResult = await topics.insertOne(newTopic);
  console.log(`\n✅ Topic inserted with ID: ${insertResult.insertedId}`);

  // ========== UPDATE LESSON ==========
  console.log('\n========== UPDATING LESSON TOPICS ARRAY ==========\n');

  const updateResult = await lessons.updateOne(
    { _id: new ObjectId(LESSON_ID) },
    { $push: { topics: 'pokemon-api' } }
  );

  if (updateResult.modifiedCount === 1) {
    console.log('✅ "pokemon-api" added to lesson topics array');
  } else {
    console.log(`❌ Failed to update lesson (matched: ${updateResult.matchedCount}, modified: ${updateResult.modifiedCount})`);
  }

  // ========== VERIFICATION ==========
  console.log('\n========== VERIFICATION ==========\n');

  // Verify topic
  const verifyTopic = await topics.findOne({ _id: insertResult.insertedId });
  console.log('Inserted topic:');
  console.log(JSON.stringify(verifyTopic, null, 2));

  // Verify lesson
  const verifyLesson = await lessons.findOne({ _id: new ObjectId(LESSON_ID) });
  console.log(`\nLesson topics array (${verifyLesson.topics.length} items):`);
  console.log(JSON.stringify(verifyLesson.topics));
  console.log(`\nLast slug: "${verifyLesson.topics[verifyLesson.topics.length - 1]}"`);

  if (verifyLesson.topics[verifyLesson.topics.length - 1] === 'pokemon-api') {
    console.log('✅ "pokemon-api" is the last topic in the lesson');
  } else {
    console.log('❌ "pokemon-api" is NOT the last topic — check ordering!');
  }

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
