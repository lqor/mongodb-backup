const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const ASYNC_LESSON_IDS = [
  '695ebaa735aada7a8f2f4092', // What is Async Apex?
  '69691b55d331617a8ce8abbb', // Schedulable Apex
  '69692324d331617a8ce8abc4', // Queueables in Apex
  '6969339bd331617a8ce8abd0', // Batch Apex
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');
  const topics = db.collection('topics');
  const lessons = db.collection('lessons');

  // Get all topics that ref any of the async lessons
  const allTopics = await topics.find({
    ref: { $in: ASYNC_LESSON_IDS }
  }).sort({ order: 1 }).toArray();

  console.log(`Found ${allTopics.length} topics across async lessons\n`);

  let totalTasks = 0;
  let totalIssues = 0;
  const issuesList = [];

  // Group topics by lesson ref
  const topicsByLesson = {};
  for (const topic of allTopics) {
    if (!topicsByLesson[topic.ref]) topicsByLesson[topic.ref] = [];
    topicsByLesson[topic.ref].push(topic);
  }

  for (const lessonId of ASYNC_LESSON_IDS) {
    const lesson = await lessons.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) continue;

    console.log(`${'='.repeat(100)}`);
    console.log(`LESSON: "${lesson.title}" (${lesson._id}) | order: ${lesson.order}`);

    const lessonTopics = topicsByLesson[lessonId] || [];
    console.log(`Topics: ${lessonTopics.length}\n`);

    for (const topic of lessonTopics) {
      const topicTasks = await tasks.find({
        ref: String(topic._id),
        testMode: { $ne: true }
      }).sort({ order: 1 }).toArray();

      console.log(`  ${'─'.repeat(90)}`);
      console.log(`  TOPIC: "${topic.topicName}" (${topic._id}) | tasks: ${topicTasks.length}`);

      if (topicTasks.length === 0) {
        console.log(`  (no active tasks)\n`);
        continue;
      }
      console.log();

      for (const task of topicTasks) {
        totalTasks++;
        const issues = [];

        // orgCode: false but defines class with interface
        if (!task.orgCode && task.solution) {
          if (task.solution.includes('implements Database.Batchable')) {
            issues.push('orgCode:false but implements Database.Batchable');
          }
          if (task.solution.includes('implements Schedulable')) {
            issues.push('orgCode:false but implements Schedulable');
          }
        }

        // Language
        if (task.description) {
          const firstPart = task.description.substring(0, 100).toLowerCase();
          if (firstPart.includes('complete the') || firstPart.includes('fill in the') || firstPart.includes('complete this')) {
            issues.push('Uses "Complete"/"Fill in" language');
          }
        }

        // System.debug in solution
        if (task.solution && task.solution.includes('System.debug')) {
          issues.push('System.debug in solution');
        }

        // System.assert in solution
        if (task.solution && task.solution.includes('System.assert')) {
          issues.push('System.assert in solution');
        }

        // System.assert in tests
        if (task.tests) {
          const hasOldAssert = task.tests.some(t => t.includes('System.assert'));
          if (hasOldAssert) {
            issues.push('System.assert in tests');
          }
        }

        // Casting
        if (task.solution && /\(List<sObject>\)/.test(task.solution)) {
          issues.push('Casting (List<sObject>) in solution');
        }

        // Req/test mismatch
        const reqCount = task.requirements ? task.requirements.length : 0;
        const testCount = task.tests ? task.tests.length : 0;
        if (reqCount !== testCount) {
          issues.push(`Req/test mismatch: ${reqCount} reqs vs ${testCount} tests`);
        }

        // Template for orgCode tasks
        if (task.orgCode && task.template && task.template.trim().length > 30) {
          issues.push('orgCode:true but has long template');
        }

        // LIMIT 0
        if (task.solution && task.solution.includes('LIMIT 0')) {
          issues.push('LIMIT 0 in solution');
        }

        // Delta/description mismatch
        if (task.delta && task.description) {
          const deltaText = task.delta[0] && task.delta[0].insert ? task.delta[0].insert.trim() : '';
          if (deltaText && deltaText !== task.description.trim()) {
            issues.push('Delta != description');
          }
        }

        const status = issues.length > 0 ? `⚠️ ${issues.length} ISSUE${issues.length > 1 ? 'S' : ''}` : '✅ OK';

        if (issues.length > 0) {
          totalIssues += issues.length;
          issuesList.push({ id: task._id, lesson: lesson.title, topic: topic.topicName, order: task.order, issues });
        }

        console.log(`    Task ${task.order || '?'}: ${task._id} [${status}]`);
        console.log(`      orgCode: ${task.orgCode} | difficulty: ${task.difficulty} | points: ${task.points} | reqs: ${reqCount} | tests: ${testCount}`);
        console.log(`      Desc: ${task.description ? task.description.substring(0, 120) : 'none'}...`);
        if (issues.length > 0) {
          for (const issue of issues) {
            console.log(`      ⚠️  ${issue}`);
          }
        }
        console.log();
      }
    }
  }

  // Summary
  console.log(`\n${'='.repeat(100)}`);
  console.log(`SUMMARY`);
  console.log(`${'='.repeat(100)}`);
  console.log(`Total tasks scanned: ${totalTasks}`);
  console.log(`Total issues found: ${totalIssues}`);
  console.log(`Tasks with issues: ${issuesList.length}\n`);

  if (issuesList.length > 0) {
    console.log('ALL ISSUES:\n');
    for (const item of issuesList) {
      console.log(`  ${item.id} | "${item.topic}" (order ${item.order}) | Lesson: "${item.lesson}"`);
      for (const issue of item.issues) {
        console.log(`    ⚠️  ${issue}`);
      }
      console.log();
    }
  }

  await client.close();
  console.log('Done!');
}

main().catch(console.error);
