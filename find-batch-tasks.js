const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority";

async function findBatchTasks() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('learn-apex');

    // Find all topics related to batch
    console.log("=== BATCH-RELATED TOPICS ===\n");
    const batchTopics = await db.collection('topics').find({
      topicName: { $regex: /batch/i }
    }).toArray();

    for (const topic of batchTopics) {
      console.log(`Topic: "${topic.topicName}"`);
      console.log(`  ID: ${topic._id}`);
      console.log(`  Order: ${topic.order}`);
      console.log(`  Lesson ref: ${topic.ref}`);
      console.log(`  Link: ${topic.link}`);
      console.log(`  Tasks IDs: ${JSON.stringify(topic.tasks)}`);
      console.log();
    }

    // Find the lesson these topics belong to
    if (batchTopics.length > 0) {
      const lessonRef = batchTopics[0].ref;
      const lesson = await db.collection('lessons').findOne({ _id: { $in: batchTopics.map(t => t.ref) } });

      // Try by string ID
      const lessons = await db.collection('lessons').find({}).toArray();
      const batchLessons = lessons.filter(l =>
        batchTopics.some(t => String(t.ref) === String(l._id))
      );

      console.log("=== PARENT LESSON(S) ===\n");
      for (const lesson of batchLessons) {
        console.log(`Lesson: "${lesson.title}"`);
        console.log(`  ID: ${lesson._id}`);
        console.log(`  Order: ${lesson.order}`);
        console.log(`  Topics: ${JSON.stringify(lesson.topics)}`);
        console.log();
      }
    }

    // Now find the "Batchable Interface" topic specifically
    console.log("=== BATCHABLE INTERFACE TOPIC - DETAILED ===\n");
    const batchableInterface = batchTopics.find(t =>
      t.topicName.toLowerCase().includes('batchable interface')
    );

    if (batchableInterface) {
      console.log(`Topic: "${batchableInterface.topicName}"`);
      console.log(`  ID: ${batchableInterface._id}`);
      console.log(`  Task IDs: ${JSON.stringify(batchableInterface.tasks)}`);
      console.log();

      // Fetch all tasks for this topic
      if (batchableInterface.tasks && batchableInterface.tasks.length > 0) {
        console.log("=== TASKS IN BATCHABLE INTERFACE ===\n");

        for (const taskId of batchableInterface.tasks) {
          // Try both string match and ObjectId
          const task = await db.collection('tasks').findOne({ _id: taskId })
            || await db.collection('tasks').findOne({ _id: { $eq: taskId } });

          if (task) {
            console.log(`--- Task: order ${task.order} ---`);
            console.log(`  ID: ${task._id}`);
            console.log(`  Description: ${task.description.substring(0, 200)}...`);
            console.log(`  Difficulty: ${task.difficulty}`);
            console.log(`  Points: ${task.points}`);
            console.log(`  OrgCode: ${task.orgCode}`);
            console.log(`  TestMode: ${task.testMode}`);
            console.log(`  Template: ${task.template ? task.template.substring(0, 150) : 'none'}...`);
            console.log(`  PreCode: ${task.preCode ? task.preCode.substring(0, 150) : 'none'}...`);
            console.log(`  Solution: ${task.solution ? task.solution.substring(0, 200) : 'none'}...`);
            console.log(`  Requirements: ${JSON.stringify(task.requirements)}`);
            console.log(`  Tests: ${JSON.stringify(task.tests)}`);
            console.log(`  Ref (topic): ${task.ref}`);
            console.log(`  LessonRef: ${task.lessonRef}`);
            console.log();
          } else {
            console.log(`  Task ${taskId} NOT FOUND in tasks collection`);
          }
        }
      }

      // Also find any tasks that reference this topic via ref field but aren't in the topic's tasks array
      console.log("=== TASKS REFERENCING THIS TOPIC VIA ref FIELD ===\n");
      const refTasks = await db.collection('tasks').find({
        ref: String(batchableInterface._id)
      }).toArray();

      console.log(`Found ${refTasks.length} tasks with ref = ${batchableInterface._id}`);
      for (const task of refTasks) {
        const inArray = batchableInterface.tasks.includes(String(task._id));
        console.log(`  - ${task._id} (order: ${task.order}, in topic.tasks array: ${inArray})`);
      }
    }

    // Print ALL batch topics with their tasks for context
    console.log("\n=== ALL BATCH TOPICS WITH FULL TASK DETAILS ===\n");
    for (const topic of batchTopics) {
      console.log(`\n====== TOPIC: "${topic.topicName}" (order: ${topic.order}) ======`);

      const tasksForTopic = await db.collection('tasks').find({
        ref: String(topic._id)
      }).sort({ order: 1 }).toArray();

      for (const task of tasksForTopic) {
        console.log(`\n  --- Task order ${task.order} (${task._id}) ---`);
        console.log(`  Description:\n${task.description}`);
        console.log(`  Difficulty: ${task.difficulty}`);
        console.log(`  Points: ${task.points}`);
        console.log(`  OrgCode: ${task.orgCode}`);
        console.log(`  TestMode: ${task.testMode}`);
        console.log(`  Template:\n${task.template}`);
        console.log(`  PreCode:\n${task.preCode}`);
        console.log(`  Solution:\n${task.solution}`);
        console.log(`  Requirements: ${JSON.stringify(task.requirements, null, 2)}`);
        console.log(`  Tests: ${JSON.stringify(task.tests, null, 2)}`);
      }
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
}

findBatchTasks();
