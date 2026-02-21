const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const SIMPLE_LOGGING_IDS = [
  '697233bd38f7e59865987e7a',
  '6972364e38f7e59865987e81',
  '6972364e38f7e59865987e80',
  '6972364e38f7e59865987e7f',
  '6972364e38f7e59865987e7e'
];

const NEBULA_LOGGER_IDS = [
  '6972394e38f7e59865987e91',
  '6972394e38f7e59865987e90',
  '6972394e38f7e59865987e8f',
  '6972394e38f7e59865987e8e',
  '6972394e38f7e59865987e8d',
  '6972394e38f7e59865987e8c',
  '6972394e38f7e59865987e8b',
  '6972394e38f7e59865987e8a',
  '6972394e38f7e59865987e89',
  '6972394e38f7e59865987e88',
  '6972394e38f7e59865987e87',
  '6972394e38f7e59865987e86',
  '6972394e38f7e59865987e85',
  '6972394e38f7e59865987e84',
  '6972394e38f7e59865987e83'
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasksCol = db.collection('tasks');
  const topicsCol = db.collection('topics');

  // Fetch topics for context
  const allTopicIds = new Set();
  const allTaskIds = [...SIMPLE_LOGGING_IDS, ...NEBULA_LOGGER_IDS];

  console.log('='.repeat(100));
  console.log('LOGGING TOPICS QUALITY CHECK');
  console.log('='.repeat(100));
  console.log();

  const allIssues = [];

  for (const topicGroup of [
    { name: 'simple-logging', ids: SIMPLE_LOGGING_IDS },
    { name: 'nebula-logger', ids: NEBULA_LOGGER_IDS }
  ]) {
    console.log('#'.repeat(100));
    console.log(`TOPIC: ${topicGroup.name} (${topicGroup.ids.length} tasks)`);
    console.log('#'.repeat(100));
    console.log();

    for (const taskId of topicGroup.ids) {
      const task = await tasksCol.findOne({ _id: new ObjectId(taskId) });

      if (!task) {
        console.log(`TASK NOT FOUND: ${taskId}`);
        allIssues.push({ topic: topicGroup.name, taskId, severity: 'critical', issue: 'Task not found in database' });
        continue;
      }

      const issues = [];
      const descShort = (task.description || '').substring(0, 60);
      const order = task.order !== undefined ? task.order : 'UNSET';

      console.log(`TASK: [${order}] ${descShort}... (id: ${taskId})`);

      // 1. orgCode correctness
      const orgCode = task.orgCode === true;
      console.log(`  orgCode: ${orgCode}`);

      // Check if this looks like a class/method creation task
      const desc = task.description || '';
      const sol = task.solution || '';
      const hasClassDef = sol.match(/public\s+class\s+/i) || sol.match(/global\s+class\s+/i);
      const hasMethodCreation = desc.toLowerCase().includes('write') || desc.toLowerCase().includes('create');
      const hasFillIn = desc.toLowerCase().includes('complete') || desc.toLowerCase().includes('fill in');

      // 2. Description language check
      if (orgCode && hasFillIn) {
        issues.push({ severity: 'warning', issue: `orgCode:true but description uses "Complete"/"Fill in" language` });
      }
      if (!orgCode && hasClassDef && !hasFillIn) {
        // orgCode:false but solution has a class definition - might need orgCode:true
        // Only flag if it seems like a full class creation task
        if (desc.toLowerCase().includes('write a class') || desc.toLowerCase().includes('create a class')) {
          issues.push({ severity: 'warning', issue: `Description says write/create a class but orgCode is false` });
        }
      }

      // 3. Template check
      const template = task.template || '';
      if (orgCode && template !== '' && template !== '// Write your code here') {
        issues.push({ severity: 'warning', issue: `orgCode:true but template is not empty: "${template.substring(0, 80)}..."` });
      }
      if (!orgCode && template === '') {
        issues.push({ severity: 'warning', issue: `orgCode:false but template is empty (should have starter code)` });
      }
      const templateCheck = orgCode ? (template === '' || template === '// Write your code here') : (template !== '');
      console.log(`  Template check: ${templateCheck ? '✅' : '❌'}`);

      // 4. Solution checks
      // System.debug
      const solutionHasDebug = /System\.debug\s*\(/i.test(sol);
      console.log(`  System.debug in solution: ${solutionHasDebug ? '❌ FOUND' : '✅ clean'}`);
      if (solutionHasDebug) {
        issues.push({ severity: 'critical', issue: 'System.debug found in solution (causes phantom requirements)' });
      }

      // Unnecessary comments
      const solutionLines = sol.split('\n');
      const badComments = solutionLines.filter(line => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('//')) return false;
        // OK comments
        if (trimmed === '// Write your code here') return false;
        if (trimmed.includes('variable is already provided')) return false;
        if (trimmed.includes('already provided')) return false;
        // Bad: descriptive comments
        return true;
      });
      const hasUnnecessaryComments = badComments.length > 0;
      console.log(`  Comments in solution: ${hasUnnecessaryComments ? '❌ ' + badComments.length + ' found' : '✅ clean'}`);
      if (hasUnnecessaryComments) {
        issues.push({ severity: 'warning', issue: `Unnecessary comments in solution: ${badComments.map(c => c.trim()).join(' | ')}` });
      }

      // Casting from List<sObject>
      if (/List<sObject>\s*\)\s*scope/i.test(sol) || /\(List<[A-Z]\w+>\)\s*scope/i.test(sol)) {
        issues.push({ severity: 'warning', issue: 'Solution casts from List<sObject>' });
      }

      // [0] instead of .get(0)
      const bracketAccess = sol.match(/\w+\[\d+\]/g);
      if (bracketAccess) {
        // Filter out array declarations and string indexing
        const realBracketAccess = bracketAccess.filter(m => !m.match(/^(new|String|Integer|Boolean|Decimal|Double|Long|Id|Date)/));
        if (realBracketAccess.length > 0) {
          issues.push({ severity: 'warning', issue: `Uses bracket notation [0] instead of .get(0): ${realBracketAccess.join(', ')}` });
        }
      }

      // 5. preCode System.debug
      const preCode = task.preCode || '';
      const preCodeHasDebug = /System\.debug\s*\(/i.test(preCode);
      console.log(`  System.debug in preCode: ${preCodeHasDebug ? '❌ FOUND' : '✅ clean'}`);
      if (preCodeHasDebug) {
        issues.push({ severity: 'critical', issue: 'System.debug found in preCode (causes phantom requirements)' });
      }

      // 6. Requirements count = Tests count
      const reqs = task.requirements || [];
      const tests = task.tests || [];
      const reqTestMatch = reqs.length === tests.length;
      console.log(`  reqs: ${reqs.length} | tests: ${tests.length} | match: ${reqTestMatch ? '✅' : '❌'}`);
      if (!reqTestMatch) {
        issues.push({ severity: 'critical', issue: `Requirements count (${reqs.length}) != Tests count (${tests.length})` });
      }

      // 7/8. Test type checks
      if (!orgCode) {
        // orgCode:false — tests must be assertion-only (no variable declarations that could conflict)
        for (let i = 0; i < tests.length; i++) {
          const test = tests[i];
          // Check for variable declarations that could conflict with userCode
          const varDecls = test.match(/(String|Integer|Boolean|Decimal|Double|Long|Id|Date|List|Map|Set|HttpRequest|HttpResponse|Http|Object)\s+\w+\s*=/g);
          if (varDecls) {
            issues.push({ severity: 'warning', issue: `Test[${i}] for orgCode:false may have variable declarations: ${varDecls.join(', ')}` });
          }
        }
      } else {
        // orgCode:true — tests must be self-contained
        for (let i = 0; i < tests.length; i++) {
          const test = tests[i];
          // Check if test is self-contained (should have instantiation or setup)
          if (!test.includes('new ') && !test.includes('=') && !test.includes('[SELECT')) {
            issues.push({ severity: 'info', issue: `Test[${i}] for orgCode:true may not be self-contained (no 'new' or assignments found)` });
          }
        }
      }

      // 9. Assert style
      const allTestCode = tests.join('\n');
      const hasOldAssert = /System\.assert\s*\(/i.test(allTestCode) ||
                           /System\.assertEquals\s*\(/i.test(allTestCode) ||
                           /System\.assertNotEquals\s*\(/i.test(allTestCode);
      const solutionHasOldAssert = /System\.assert\s*\(/i.test(sol) ||
                                   /System\.assertEquals\s*\(/i.test(sol) ||
                                   /System\.assertNotEquals\s*\(/i.test(sol);
      console.log(`  Assert style (no System.assert): ${(hasOldAssert || solutionHasOldAssert) ? '❌' : '✅'}`);
      if (hasOldAssert) {
        issues.push({ severity: 'warning', issue: 'Tests use System.assert/assertEquals instead of Assert.areEqual/isTrue' });
      }
      if (solutionHasOldAssert) {
        issues.push({ severity: 'warning', issue: 'Solution uses System.assert/assertEquals instead of Assert class' });
      }

      // 10. Delta matches description
      const delta = task.delta || [];
      let deltaSynced = false;
      if (delta.length === 1 && delta[0].insert === desc + '\n') {
        deltaSynced = true;
      } else if (delta.length === 1 && delta[0].insert === desc) {
        // Close enough but missing trailing newline
        deltaSynced = false;
        issues.push({ severity: 'info', issue: 'Delta matches description but missing trailing newline' });
      }
      console.log(`  Delta synced: ${deltaSynced ? '✅' : '❌'}`);
      if (!deltaSynced && !issues.find(i => i.issue.includes('Delta'))) {
        issues.push({ severity: 'warning', issue: 'Delta does not match description' });
      }

      // 11. Order check
      const orderSet = task.order !== undefined && task.order !== null;
      console.log(`  Order set: ${orderSet ? '✅ (' + task.order + ')' : '❌'}`);
      if (!orderSet) {
        issues.push({ severity: 'warning', issue: 'Order field not set' });
      }

      // 12. Variable name consistency (basic check - look for variable names in requirements vs tests)
      // This is a heuristic check

      // 13. SOQL queries - check for LIMIT 0
      const allCode = sol + '\n' + preCode + '\n' + tests.join('\n');
      const limitZero = allCode.match(/LIMIT\s+0/gi);
      if (limitZero) {
        issues.push({ severity: 'critical', issue: 'SOQL query with LIMIT 0 found' });
      }

      // 14. Task belongs in topic (basic check)
      if (topicGroup.name === 'simple-logging') {
        if (!desc.toLowerCase().includes('log') && !desc.toLowerCase().includes('debug') && !sol.toLowerCase().includes('system.debug') && !sol.toLowerCase().includes('log')) {
          issues.push({ severity: 'info', issue: 'Task may not belong in simple-logging topic (no logging-related keywords found)' });
        }
      }
      if (topicGroup.name === 'nebula-logger') {
        if (!desc.toLowerCase().includes('nebula') && !desc.toLowerCase().includes('logger') && !sol.toLowerCase().includes('logger')) {
          issues.push({ severity: 'info', issue: 'Task may not belong in nebula-logger topic (no nebula/logger keywords found)' });
        }
      }

      // Additional checks
      // Check difficulty is set
      if (!task.difficulty) {
        issues.push({ severity: 'info', issue: 'Difficulty not set' });
      }

      // Check points is set
      if (!task.points && task.points !== 0) {
        issues.push({ severity: 'info', issue: 'Points not set' });
      }

      // Check testMode
      if (task.testMode === true) {
        issues.push({ severity: 'info', issue: 'Task is in testMode (hidden)' });
      }

      // Print issues
      if (issues.length > 0) {
        console.log(`  ISSUES:`);
        for (const issue of issues) {
          console.log(`    [${issue.severity.toUpperCase()}] ${issue.issue}`);
          allIssues.push({ topic: topicGroup.name, taskId, order, descShort, ...issue });
        }
      } else {
        console.log(`  ISSUES: None found`);
      }

      console.log();
    }
  }

  // Print full task data for manual inspection
  console.log('\n' + '='.repeat(100));
  console.log('FULL TASK DATA DUMP');
  console.log('='.repeat(100));

  for (const topicGroup of [
    { name: 'simple-logging', ids: SIMPLE_LOGGING_IDS },
    { name: 'nebula-logger', ids: NEBULA_LOGGER_IDS }
  ]) {
    console.log(`\n${'#'.repeat(80)}`);
    console.log(`TOPIC: ${topicGroup.name}`);
    console.log(`${'#'.repeat(80)}`);

    for (const taskId of topicGroup.ids) {
      const task = await tasksCol.findOne({ _id: new ObjectId(taskId) });
      if (!task) continue;

      console.log(`\n${'─'.repeat(80)}`);
      console.log(`ID: ${taskId} | Order: ${task.order} | orgCode: ${task.orgCode} | difficulty: ${task.difficulty} | points: ${task.points}`);
      console.log(`Description: ${task.description}`);
      console.log(`Template:\n${task.template || '(empty)'}`);
      console.log(`Solution:\n${task.solution}`);
      console.log(`PreCode:\n${task.preCode || '(empty)'}`);
      console.log(`Requirements (${(task.requirements || []).length}):`);
      (task.requirements || []).forEach((r, i) => console.log(`  [${i}] ${r}`));
      console.log(`Tests (${(task.tests || []).length}):`);
      (task.tests || []).forEach((t, i) => console.log(`  [${i}] ${t}`));
      console.log(`Delta: ${JSON.stringify(task.delta)}`);
      console.log(`Ref: ${task.ref}`);
      console.log(`testMode: ${task.testMode}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(100));
  console.log('ISSUE SUMMARY');
  console.log('='.repeat(100));

  const critical = allIssues.filter(i => i.severity === 'critical');
  const warnings = allIssues.filter(i => i.severity === 'warning');
  const infos = allIssues.filter(i => i.severity === 'info');

  console.log(`\nCRITICAL (${critical.length}):`);
  for (const i of critical) {
    console.log(`  [${i.topic}] Task ${i.order} (${i.taskId}): ${i.issue}`);
  }

  console.log(`\nWARNING (${warnings.length}):`);
  for (const i of warnings) {
    console.log(`  [${i.topic}] Task ${i.order} (${i.taskId}): ${i.issue}`);
  }

  console.log(`\nINFO (${infos.length}):`);
  for (const i of infos) {
    console.log(`  [${i.topic}] Task ${i.order} (${i.taskId}): ${i.issue}`);
  }

  console.log(`\nTotal issues: ${allIssues.length} (${critical.length} critical, ${warnings.length} warnings, ${infos.length} info)`);

  await client.close();
}

main().catch(console.error);
