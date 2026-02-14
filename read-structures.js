const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority";

async function readStructures() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    // ===== learn-apex =====
    console.log("============================================");
    console.log("DATABASE: learn-apex");
    console.log("============================================");

    const apexDb = client.db('learn-apex');

    // Tasks
    console.log("\n--- learn-apex.tasks (sample, 813 docs total) ---");
    const apexTasks = await apexDb.collection('tasks').find().limit(3).toArray();
    apexTasks.forEach((t, i) => {
      console.log(`\nTask ${i + 1}:`);
      console.log(JSON.stringify(t, null, 2));
    });

    // Topics
    console.log("\n--- learn-apex.topics (sample, 178 docs total) ---");
    const apexTopics = await apexDb.collection('topics').find().limit(3).toArray();
    apexTopics.forEach((t, i) => {
      console.log(`\nTopic ${i + 1}:`);
      console.log(JSON.stringify(t, null, 2));
    });

    // Lessons
    console.log("\n--- learn-apex.lessons (sample, 31 docs total) ---");
    const apexLessons = await apexDb.collection('lessons').find().limit(3).toArray();
    apexLessons.forEach((t, i) => {
      console.log(`\nLesson ${i + 1}:`);
      console.log(JSON.stringify(t, null, 2));
    });

    // ===== learn-lwc =====
    console.log("\n\n============================================");
    console.log("DATABASE: learn-lwc");
    console.log("============================================");

    const lwcDb = client.db('learn-lwc');

    // Tasks
    console.log("\n--- learn-lwc.tasks (sample, 8 docs total) ---");
    const lwcTasks = await lwcDb.collection('tasks').find().limit(3).toArray();
    lwcTasks.forEach((t, i) => {
      console.log(`\nTask ${i + 1}:`);
      console.log(JSON.stringify(t, null, 2));
    });

    // Topics
    console.log("\n--- learn-lwc.topics (sample, 5 docs total) ---");
    const lwcTopics = await lwcDb.collection('topics').find().limit(5).toArray();
    lwcTopics.forEach((t, i) => {
      console.log(`\nTopic ${i + 1}:`);
      console.log(JSON.stringify(t, null, 2));
    });

    // Lessons
    console.log("\n--- learn-lwc.lessons (sample, 5 docs total) ---");
    const lwcLessons = await lwcDb.collection('lessons').find().limit(5).toArray();
    lwcLessons.forEach((t, i) => {
      console.log(`\nLesson ${i + 1}:`);
      console.log(JSON.stringify(t, null, 2));
    });

    // Modules
    console.log("\n--- learn-lwc.modules (sample, 3 docs total) ---");
    const lwcModules = await lwcDb.collection('modules').find().limit(3).toArray();
    lwcModules.forEach((t, i) => {
      console.log(`\nModule ${i + 1}:`);
      console.log(JSON.stringify(t, null, 2));
    });

    // Tests
    console.log("\n--- learn-lwc.tests (sample, 67 docs total) ---");
    const lwcTests = await lwcDb.collection('tests').find().limit(3).toArray();
    lwcTests.forEach((t, i) => {
      console.log(`\nTest ${i + 1}:`);
      console.log(JSON.stringify(t, null, 2));
    });

    // ===== lwc-mastery-cohort =====
    console.log("\n\n============================================");
    console.log("DATABASE: lwc-mastery-cohort");
    console.log("============================================");

    const cohortDb = client.db('lwc-mastery-cohort');

    // Tasks
    console.log("\n--- lwc-mastery-cohort.tasks (sample, 77 docs total) ---");
    const cohortTasks = await cohortDb.collection('tasks').find().limit(3).toArray();
    cohortTasks.forEach((t, i) => {
      console.log(`\nTask ${i + 1}:`);
      console.log(JSON.stringify(t, null, 2));
    });

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
    console.log("\nConnection closed.");
  }
}

readStructures();
