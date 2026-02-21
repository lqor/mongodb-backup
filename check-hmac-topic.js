const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const TASK_IDS = [
  '6974fe70fa17fbf3b1b8be2e',
  '6974fe70fa17fbf3b1b8be2f',
  '6974fe70fa17fbf3b1b8be30',
  '6974fe70fa17fbf3b1b8be31',
  '6974fe70fa17fbf3b1b8be32',
  '6974fe70fa17fbf3b1b8be33',
];

const TOPIC_ID = '6970d58b0a6f66b9d8042ff3';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasksCol = db.collection('tasks');
  const topicsCol = db.collection('topics');

  // Fetch the topic
  const topic = await topicsCol.findOne({ _id: new ObjectId(TOPIC_ID) });
  console.log('=== TOPIC INFO ===');
  console.log(`Name: ${topic?.title || topic?.name || 'N/A'}`);
  console.log(`Link: ${topic?.link || 'N/A'}`);
  console.log(`Tasks in topic array: ${topic?.tasks?.length || 0}`);
  console.log(`Task IDs in topic: ${JSON.stringify(topic?.tasks)}`);
  console.log('');

  // Fetch all 6 tasks
  const tasks = await tasksCol.find({
    _id: { $in: TASK_IDS.map(id => new ObjectId(id)) }
  }).toArray();

  console.log(`Found ${tasks.length} of ${TASK_IDS.length} tasks\n`);

  const allIssues = [];

  for (const task of tasks) {
    const id = task._id.toString();
    const desc = task.description || '';
    const descShort = desc.substring(0, 80).replace(/\n/g, ' ');
    const solution = task.solution || '';
    const preCode = task.preCode || '';
    const template = task.template || '';
    const orgCode = task.orgCode;
    const reqs = task.requirements || [];
    const tests = task.tests || [];
    const delta = task.delta || [];
    const order = task.order;
    const difficulty = task.difficulty;
    const testMode = task.testMode;
    const ref = task.ref;

    const taskIssues = [];

    console.log('='.repeat(80));
    console.log(`TASK: [${order}] ${descShort} (id: ${id})`);
    console.log(`  difficulty: ${difficulty} | testMode: ${testMode} | ref: ${ref}`);
    console.log(`  orgCode: ${orgCode}`);

    // 1. orgCode correctness check
    const hasClassDef = /\bclass\b/.test(solution);
    const hasMethodDef = /\b(public|private|global)\s+(static\s+)?(void|String|Integer|Boolean|Map|List|Set|Object|Blob|Id)\s+\w+\s*\(/.test(solution);
    if (orgCode === true && !hasClassDef && !hasMethodDef) {
      taskIssues.push({ severity: 'warning', msg: 'orgCode=true but solution has no class/method definition' });
    }
    if (orgCode === false && hasClassDef) {
      taskIssues.push({ severity: 'warning', msg: 'orgCode=false but solution defines a class — should this be orgCode:true?' });
    }

    // 2. Description language
    if (orgCode === true) {
      if (/\b(Complete|Fill in)\b/i.test(desc) && !/\b(Write|Create|Add|Build|Implement)\b/i.test(desc)) {
        taskIssues.push({ severity: 'warning', msg: 'orgCode:true description uses "Complete"/"Fill in" instead of "Write"/"Create"' });
      }
    }

    // 3. Template check
    if (orgCode === true) {
      if (template && template.trim() !== '' && template.trim() !== '// Write your code here') {
        taskIssues.push({ severity: 'critical', msg: `orgCode:true but template is not empty: "${template.substring(0, 60)}..."` });
      }
      console.log(`  Template check (should be empty): ${(!template || template.trim() === '' || template.trim() === '// Write your code here') ? 'OK' : 'ISSUE'}`);
    } else {
      if (!template || template.trim() === '') {
        taskIssues.push({ severity: 'warning', msg: 'orgCode:false but template is empty — users need starter code' });
      }
      console.log(`  Template check (should have code): ${(template && template.trim() !== '') ? 'OK' : 'ISSUE'}`);
    }

    // 4. Solution checks
    const hasDebugInSolution = /System\.debug\s*\(/i.test(solution);
    const hasDebugInPreCode = /System\.debug\s*\(/i.test(preCode);
    const hasCasting = /\(List<\w+>\)\s*scope/i.test(solution);
    const hasBracketAccess = /\[\s*0\s*\]/.test(solution);
    const hasUnnecessaryComments = solution.split('\n').some(line => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('//')) return false;
      if (trimmed === '// Write your code here') return false;
      if (/\/\/\s*\w+\s+variable\s+is\s+already\s+provided/i.test(trimmed)) return false;
      return true;
    });

    console.log(`  reqs: ${reqs.length} | tests: ${tests.length} | match: ${reqs.length === tests.length ? 'YES' : 'NO'}`);
    console.log(`  System.debug in solution: ${hasDebugInSolution ? 'FOUND' : 'clean'}`);
    console.log(`  System.debug in preCode: ${hasDebugInPreCode ? 'FOUND' : 'clean'}`);

    if (hasDebugInSolution) {
      taskIssues.push({ severity: 'critical', msg: 'System.debug found in solution — causes phantom requirements' });
    }
    if (hasDebugInPreCode) {
      taskIssues.push({ severity: 'critical', msg: 'System.debug found in preCode — causes phantom requirements' });
    }
    if (reqs.length !== tests.length) {
      taskIssues.push({ severity: 'critical', msg: `Req/test count mismatch: ${reqs.length} reqs vs ${tests.length} tests` });
    }
    if (hasCasting) {
      taskIssues.push({ severity: 'warning', msg: 'Solution casts from List<sObject>' });
    }
    if (hasBracketAccess) {
      taskIssues.push({ severity: 'warning', msg: 'Solution uses [0] instead of .get(0)' });
    }

    // 5. Assert style check
    const allTestsStr = tests.join('\n');
    const hasOldAssert = /System\.(assert|assertEquals|assertNotEquals)\s*\(/i.test(allTestsStr);
    const hasOldAssertInSolution = /System\.(assert|assertEquals|assertNotEquals)\s*\(/i.test(solution);
    console.log(`  Assert style (no System.assert): ${(!hasOldAssert && !hasOldAssertInSolution) ? 'OK' : 'ISSUE'}`);
    if (hasOldAssert) {
      taskIssues.push({ severity: 'critical', msg: 'Tests use System.assert/assertEquals instead of Assert class' });
    }
    if (hasOldAssertInSolution) {
      taskIssues.push({ severity: 'critical', msg: 'Solution uses System.assert/assertEquals instead of Assert class' });
    }

    // 6. Delta check
    const expectedDelta = [{ insert: desc + '\n' }];
    const deltaMatch = JSON.stringify(delta) === JSON.stringify(expectedDelta);
    console.log(`  Delta synced: ${deltaMatch ? 'YES' : 'NO'}`);
    if (!deltaMatch) {
      taskIssues.push({ severity: 'warning', msg: 'Delta does not match description' });
    }

    // 7. Order check
    console.log(`  Order set: ${order !== undefined && order !== null ? `YES (${order})` : 'NO'}`);
    if (order === undefined || order === null) {
      taskIssues.push({ severity: 'warning', msg: 'Order field not set' });
    }

    // 8. Comments in solution
    console.log(`  Unnecessary comments in solution: ${hasUnnecessaryComments ? 'YES' : 'clean'}`);
    if (hasUnnecessaryComments) {
      const commentLines = solution.split('\n').filter(line => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('//')) return false;
        if (trimmed === '// Write your code here') return false;
        if (/\/\/\s*\w+\s+variable\s+is\s+already\s+provided/i.test(trimmed)) return false;
        return true;
      });
      taskIssues.push({ severity: 'warning', msg: `Unnecessary comments in solution: ${commentLines.map(l => l.trim()).join(' | ')}` });
    }

    // 9. SOQL LIMIT check
    const soqlLimitMatch = solution.match(/LIMIT\s+(\d+)/gi);
    if (soqlLimitMatch) {
      soqlLimitMatch.forEach(m => {
        const num = parseInt(m.match(/\d+/)[0]);
        if (num === 0) {
          taskIssues.push({ severity: 'critical', msg: 'SOQL query uses LIMIT 0' });
        }
      });
    }

    // 10. orgCode:false test check — should be assertion-only
    if (orgCode === false) {
      tests.forEach((test, i) => {
        // Check if test declares variables that might conflict with solution
        const testDeclares = test.match(/\b(String|Integer|Boolean|Map|List|Set|HttpRequest|HttpResponse|Http|Blob|Object)\s+\w+\s*=/g);
        if (testDeclares && testDeclares.length > 0) {
          // Check if any declared var also exists in solution
          testDeclares.forEach(decl => {
            const varName = decl.match(/\s(\w+)\s*=$/)[1];
            const inSolution = new RegExp(`\\b${varName}\\b`).test(solution);
            if (inSolution) {
              taskIssues.push({ severity: 'critical', msg: `Test[${i}] redeclares variable '${varName}' that exists in solution — will cause "Duplicate field" error` });
            }
          });
        }
      });
    }

    // 11. orgCode:true test check — should be self-contained
    if (orgCode === true) {
      tests.forEach((test, i) => {
        const hasAssert = /Assert\.\w+/i.test(test);
        if (!hasAssert) {
          taskIssues.push({ severity: 'warning', msg: `Test[${i}] for orgCode:true has no Assert statement` });
        }
      });
    }

    // 12. Bracket access in tests
    const bracketInTests = /\[\s*0\s*\]/.test(allTestsStr);
    if (bracketInTests) {
      taskIssues.push({ severity: 'info', msg: 'Tests use [0] instead of .get(0)' });
    }

    // 13. ref field check
    if (ref !== TOPIC_ID) {
      taskIssues.push({ severity: 'critical', msg: `Task ref "${ref}" does not match topic ID "${TOPIC_ID}"` });
    }

    // Print issues
    if (taskIssues.length === 0) {
      console.log('  ISSUES: None');
    } else {
      console.log(`  ISSUES (${taskIssues.length}):`);
      taskIssues.forEach(issue => {
        console.log(`    [${issue.severity.toUpperCase()}] ${issue.msg}`);
      });
    }
    allIssues.push({ taskId: id, order, descShort, issues: taskIssues });

    // Print full data for manual inspection
    console.log('\n  --- FULL DATA ---');
    console.log(`  Description: ${desc}`);
    console.log(`  Solution:\n${solution.split('\n').map(l => '    ' + l).join('\n')}`);
    console.log(`  preCode:\n${preCode.split('\n').map(l => '    ' + l).join('\n')}`);
    console.log(`  Template:\n${template.split('\n').map(l => '    ' + l).join('\n')}`);
    console.log(`  Requirements:`);
    reqs.forEach((r, i) => console.log(`    [${i}] ${r}`));
    console.log(`  Tests:`);
    tests.forEach((t, i) => console.log(`    [${i}] ${t}`));
    console.log('');
  }

  // Order check across all tasks
  const orders = tasks.map(t => t.order).filter(o => o !== undefined && o !== null).sort((a, b) => a - b);
  console.log('\n=== ORDER ANALYSIS ===');
  console.log(`Orders found: ${JSON.stringify(orders)}`);
  const expectedOrders = Array.from({ length: tasks.length }, (_, i) => i + 1);
  if (JSON.stringify(orders) !== JSON.stringify(expectedOrders)) {
    console.log(`Expected: ${JSON.stringify(expectedOrders)}`);
    console.log('ORDER ISSUE: Orders are not sequential 1..N');
  } else {
    console.log('Orders are sequential 1..N: OK');
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('=== SUMMARY OF ALL ISSUES ===\n');

  const critical = [];
  const warning = [];
  const info = [];

  allIssues.forEach(({ taskId, order, descShort, issues }) => {
    issues.forEach(issue => {
      const entry = `Task [${order}] (${taskId}): ${issue.msg}`;
      if (issue.severity === 'critical') critical.push(entry);
      else if (issue.severity === 'warning') warning.push(entry);
      else info.push(entry);
    });
  });

  console.log(`CRITICAL (${critical.length}) — breaks the task:`);
  critical.forEach(c => console.log(`  - ${c}`));
  console.log('');

  console.log(`WARNING (${warning.length}) — should fix:`);
  warning.forEach(w => console.log(`  - ${w}`));
  console.log('');

  console.log(`INFO (${info.length}) — nice to have:`);
  info.forEach(i => console.log(`  - ${i}`));

  await client.close();
}

main().catch(console.error);
