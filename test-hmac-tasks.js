const { MongoClient, ObjectId } = require('mongodb');
const { execSync } = require('child_process');
const fs = require('fs');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';
const ORG = 'trailhead';
const TEMP_FILE = '/tmp/hmac-test.apex';

const TASK_IDS = [
  '6974fe70fa17fbf3b1b8be2e',
  '6974fe70fa17fbf3b1b8be2f',
  '6974fe70fa17fbf3b1b8be30',
  '6974fe70fa17fbf3b1b8be31',
  '6974fe70fa17fbf3b1b8be32',
  '6974fe70fa17fbf3b1b8be33',
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasksCol = db.collection('tasks');

  const tasks = await tasksCol.find({
    _id: { $in: TASK_IDS.map(id => new ObjectId(id)) }
  }).sort({ order: 1 }).toArray();

  console.log(`Fetched ${tasks.length} HMAC tasks\n`);

  let totalTests = 0;
  let totalPassed = 0;
  const failures = [];

  for (const task of tasks) {
    const id = task._id.toString();
    const order = task.order;
    const desc = (task.description || '').substring(0, 70).replace(/\n/g, ' ');
    const preCode = task.preCode || '';
    const solution = task.solution || '';
    const tests = task.tests || [];
    const reqs = task.requirements || [];

    console.log(`\n${'='.repeat(70)}`);
    console.log(`Task ${order} (${id}): ${desc}`);
    console.log(`  orgCode: ${task.orgCode} | reqs: ${reqs.length} | tests: ${tests.length}`);

    if (reqs.length !== tests.length) {
      console.log(`  ❌ SKIP — req/test count mismatch (${reqs.length} vs ${tests.length})`);
      continue;
    }

    for (let i = 0; i < tests.length; i++) {
      totalTests++;
      const apex = [preCode, solution, tests[i]].filter(Boolean).join('\n');

      fs.writeFileSync(TEMP_FILE, apex);

      try {
        const result = execSync(
          `sf apex run --target-org ${ORG} --file ${TEMP_FILE} 2>&1`,
          { encoding: 'utf8', timeout: 30000 }
        );

        const compiled = result.includes('Compiled successfully');
        const executed = result.includes('Executed successfully');
        const passed = compiled && executed;

        if (passed) {
          totalPassed++;
          console.log(`  test[${i}]: ✅ PASS`);
        } else {
          console.log(`  test[${i}]: ❌ FAIL`);
          const errorLines = result.split('\n').filter(l =>
            l.includes('Error') || l.includes('error') ||
            l.includes('ASSERTION') || l.includes('Exception') ||
            l.includes('Duplicate') || l.includes('unexpected')
          );
          if (errorLines.length > 0) {
            errorLines.forEach(l => console.log(`    ${l.trim()}`));
          } else {
            console.log(`    ${result.substring(0, 300)}`);
          }
          failures.push({ order, id, testIndex: i, req: reqs[i] });
        }
      } catch (err) {
        console.log(`  test[${i}]: ❌ ERROR — ${err.message.substring(0, 200)}`);
        failures.push({ order, id, testIndex: i, req: reqs[i] });
      }
    }
  }

  // Cleanup
  if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n=== RESULTS ===`);
  console.log(`Total: ${totalPassed}/${totalTests} tests passed`);

  if (failures.length > 0) {
    console.log(`\nFailed tests:`);
    failures.forEach(f => {
      console.log(`  Task ${f.order} test[${f.testIndex}]: ${f.req}`);
    });
  } else {
    console.log(`\n✅ ALL TESTS PASSED`);
  }

  await client.close();
}

main().catch(console.error);
