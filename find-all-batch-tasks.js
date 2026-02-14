const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');
  const topics = db.collection('topics');
  const lessons = db.collection('lessons');

  // Find ALL tasks that mention "batch" in description or solution
  const batchTasks = await tasks.find({
    $or: [
      { description: { $regex: /batch/i } },
      { solution: { $regex: /batch/i } },
      { description: { $regex: /Database\.executeBatch/i } },
      { solution: { $regex: /Database\.executeBatch/i } }
    ],
    testMode: { $ne: true }
  }).toArray();

  console.log(`Found ${batchTasks.length} active tasks mentioning "batch"\n`);

  // Group by topic ref
  const byTopic = {};
  for (const task of batchTasks) {
    if (!byTopic[task.ref]) byTopic[task.ref] = [];
    byTopic[task.ref].push(task);
  }

  // Known Batch Apex topic IDs (already reworked)
  const knownBatchTopics = [
    '69693440d331617a8ce8abd2', // What is Batch Apex
    '69693440d331617a8ce8abd3', // Batch Apex Structure
    '69693440d331617a8ce8abd4', // The Batchable Interface
    '69693440d331617a8ce8abd5', // The Start Method
    '69693440d331617a8ce8abd6', // The Execute Method
    '69693440d331617a8ce8abd7', // Running a Batch Job
    '69693440d331617a8ce8abd8', // Batch Apex and Scheduled
    '69693440d331617a8ce8abd9', // Testing Batch Class
  ];

  for (const [topicRef, topicTasks] of Object.entries(byTopic)) {
    const topic = await topics.findOne({ _id: new ObjectId(topicRef) });
    const topicName = topic ? topic.topicName : 'UNKNOWN TOPIC';
    const isKnown = knownBatchTopics.includes(topicRef);

    // Find parent lesson
    let lessonName = '?';
    if (topic && topic.ref) {
      const lesson = await lessons.findOne({ _id: new ObjectId(topic.ref) });
      lessonName = lesson ? lesson.title : '?';
    }

    console.log(`${'='.repeat(100)}`);
    console.log(`TOPIC: "${topicName}" (${topicRef}) ${isKnown ? '[ALREADY REWORKED]' : '[*** NOT YET REVIEWED ***]'}`);
    console.log(`LESSON: "${lessonName}"`);
    console.log(`Tasks: ${topicTasks.length}\n`);

    for (const task of topicTasks) {
      // Check for issues
      const issues = [];
      if (!task.orgCode && task.solution && task.solution.includes('class') && task.solution.includes('implements')) {
        issues.push('orgCode:false but defines a class with implements');
      }
      if (task.description && (task.description.toLowerCase().includes('complete') || task.description.toLowerCase().includes('fill in'))) {
        issues.push('Uses "Complete"/"Fill in" language');
      }
      if (task.solution && task.solution.includes('System.debug')) {
        issues.push('System.debug in solution');
      }
      if (task.solution && task.solution.includes('System.assert')) {
        issues.push('System.assert in solution (should use Assert class)');
      }
      if (task.solution && /\(List<sObject>\)\s*scope/.test(task.solution)) {
        issues.push('Casting List<sObject> in solution');
      }
      if (task.requirements && task.tests && task.requirements.length !== task.tests.length) {
        issues.push(`Req/test mismatch: ${task.requirements.length} reqs vs ${task.tests.length} tests`);
      }
      if (task.template && task.template.length > 30 && task.orgCode) {
        issues.push('orgCode:true but has a non-empty template');
      }
      if (task.solution && task.solution.includes('LIMIT 0')) {
        issues.push('LIMIT 0 in solution');
      }

      const status = issues.length > 0 ? `⚠️ ${issues.length} ISSUES` : '✅ OK';

      console.log(`  --- Task ${task.order || '?'}: ${task._id} [${status}] ---`);
      console.log(`  orgCode: ${task.orgCode} | testMode: ${task.testMode} | difficulty: ${task.difficulty} | points: ${task.points}`);
      console.log(`  Reqs: ${task.requirements ? task.requirements.length : 0} | Tests: ${task.tests ? task.tests.length : 0}`);
      console.log(`  Description: ${task.description ? task.description.substring(0, 120) : 'none'}...`);
      if (issues.length > 0) {
        for (const issue of issues) {
          console.log(`  ⚠️  ${issue}`);
        }
      }
      console.log();
    }
  }

  await client.close();
  console.log('Done!');
}

main().catch(console.error);
