/**
 * Reusable topic auditor: quality checklist + org tests
 * Usage: node audit-topic.js <topicId> [orgAlias]
 */
const { MongoClient, ObjectId } = require('mongodb');
const { execSync } = require('child_process');
const fs = require('fs');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';
const TEMP_FILE = '/tmp/audit-test.apex';

const topicId = process.argv[2];
const org = process.argv[3] || 'trailhead';

if (!topicId) {
  console.log('Usage: node audit-topic.js <topicId> [orgAlias]');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');

  // Fetch topic
  const topic = await db.collection('topics').findOne({ _id: new ObjectId(topicId) });
  if (!topic) { console.log('Topic not found!'); await client.close(); return; }
  console.log(`Topic: ${topic.title || topic.name || topic.link} (${topicId})`);
  console.log(`Tasks in topic array: ${(topic.tasks || []).length}\n`);

  // Fetch tasks by ref
  const tasks = await db.collection('tasks').find({ ref: topicId }).sort({ order: 1 }).toArray();
  console.log(`Found ${tasks.length} tasks with ref=${topicId}\n`);

  const allIssues = [];
  let totalTests = 0;
  let totalPassed = 0;
  const failures = [];

  for (const t of tasks) {
    const id = t._id.toString();
    const desc = (t.description || '').replace(/\n/g, ' ');
    const descShort = desc.substring(0, 70);
    const sol = t.solution || '';
    const pre = t.preCode || '';
    const tpl = t.template || '';
    const reqs = t.requirements || [];
    const tests = t.tests || [];
    const delta = t.delta || [];

    console.log('='.repeat(70));
    console.log(`Task ${t.order || '?'} [${id}]: ${descShort}`);
    console.log(`  difficulty: ${t.difficulty} | points: ${t.points} | orgCode: ${t.orgCode} | testMode: ${t.testMode}`);

    // ===== QUALITY CHECKS =====
    const issues = [];

    // 1. orgCode correctness
    const hasClass = /\bclass\b/.test(sol);
    if (t.orgCode === false && hasClass) issues.push('⚠️  orgCode:false but solution defines a class');
    if (t.orgCode === true && !hasClass) issues.push('⚠️  orgCode:true but no class in solution');

    // 2. Description language
    if (t.orgCode === true && /\b(Complete|Fill in)\b/i.test(desc) && !/\b(Write|Create|Add|Build)\b/i.test(desc)) {
      issues.push('⚠️  orgCode:true uses "Complete"/"Fill in" language');
    }

    // 3. Template check
    if (t.orgCode === true && tpl && tpl.trim() !== '' && tpl.trim() !== '// Write your code here') {
      issues.push('❌ orgCode:true but template has code');
    }
    if (t.orgCode === false && (!tpl || tpl.trim() === '')) {
      issues.push('⚠️  orgCode:false but template is empty');
    }

    // 4. System.debug
    if (/System\.debug\s*\(/i.test(sol)) issues.push('❌ System.debug in solution');
    if (/System\.debug\s*\(/i.test(pre)) issues.push('❌ System.debug in preCode');

    // 5. Casting
    if (/\(List<\w+>\)\s*scope/i.test(sol)) issues.push('❌ Casting in solution');

    // 6. Req/test count
    if (reqs.length !== tests.length) issues.push(`❌ req/test mismatch: ${reqs.length} reqs vs ${tests.length} tests`);

    // 7. Assert style
    const allTestsStr = tests.join('\n');
    if (/System\.(assert|assertEquals|assertNotEquals)\s*\(/i.test(allTestsStr)) issues.push('❌ Tests use System.assert');
    if (/System\.(assert|assertEquals|assertNotEquals)\s*\(/i.test(sol)) issues.push('❌ Solution uses System.assert');

    // 8. Bracket notation
    if (/\[\s*0\s*\]/.test(sol)) issues.push('⚠️  Solution uses [0] instead of .get(0)');
    if (/\[\s*0\s*\]/.test(allTestsStr)) issues.push('⚠️  Tests use [0]');
    if (/\[\s*0\s*\]/.test(pre)) issues.push('⚠️  preCode uses [0]');

    // 9. SOQL LIMIT 0
    const limitMatches = sol.match(/LIMIT\s+(\d+)/gi);
    if (limitMatches) {
      limitMatches.forEach(m => {
        if (parseInt(m.match(/\d+/)[0]) === 0) issues.push('❌ SOQL LIMIT 0');
      });
    }

    // 10. Delta matches description
    const expectedDelta = [{ insert: (t.description || '') + '\n' }];
    if (JSON.stringify(delta) !== JSON.stringify(expectedDelta)) issues.push('⚠️  Delta does not match description');

    // 11. Order
    if (t.order === null || t.order === undefined) issues.push('❌ Order not set');

    // 12. Duplicate variable check (orgCode:false)
    if (t.orgCode === false) {
      tests.forEach((test, i) => {
        const decls = test.match(/\b(String|Integer|Boolean|Map|List|Set|Blob|Object|Long|Double|Decimal|HttpRequest|HttpResponse|Http)\s+(\w+)\s*=/g);
        if (decls) {
          decls.forEach(d => {
            const match = d.match(/\s(\w+)\s*=$/);
            if (match) {
              const varName = match[1];
              if (new RegExp('\\b' + varName + '\\b').test(sol)) {
                issues.push(`❌ test[${i}] redeclares '${varName}' from solution`);
              }
            }
          });
        }
      });
    }

    // 13. Reserved words
    const reserved = ['JSON', 'Http', 'System', 'Database', 'Test', 'Url', 'Type', 'Package'];
    reserved.forEach(r => {
      if (new RegExp('\\b' + r + '\\s*=').test(sol)) issues.push(`⚠️  Variable '${r}' is reserved`);
    });

    // 14. Comments in solution
    const commentLines = sol.split('\n').filter(l => {
      const tr = l.trim();
      return tr.startsWith('//') && tr !== '// Write your code here' && !/\/\/\s*\w+\s+variable\s+is\s+already/i.test(tr);
    });
    if (commentLines.length > 0) issues.push(`⚠️  Comments in solution: ${commentLines.map(l => l.trim()).join(' | ')}`);

    // 15. Em dashes
    if (/\u2014/.test(t.description || '')) issues.push('⚠️  Description uses em dash');

    // 16. testMode
    if (t.testMode === true) issues.push('ℹ️  testMode=true (hidden)');

    // Print quality results
    if (issues.length === 0) {
      console.log('  Quality: ✅ ALL CHECKS PASSED');
    } else {
      console.log(`  Quality: ${issues.length} issue(s)`);
      issues.forEach(i => console.log(`    ${i}`));
    }
    allIssues.push({ order: t.order, id, descShort, issues });

    // ===== ORG TESTS =====
    if (t.testMode === true) {
      console.log('  Org tests: SKIPPED (testMode=true)');
      continue;
    }
    if (reqs.length !== tests.length) {
      console.log('  Org tests: SKIPPED (req/test mismatch)');
      continue;
    }

    for (let i = 0; i < tests.length; i++) {
      totalTests++;
      let apex;
      if (t.orgCode === false) {
        apex = [pre, sol, tests[i]].filter(Boolean).join('\n');
      } else {
        apex = [pre, tests[i]].filter(Boolean).join('\n');
      }

      fs.writeFileSync(TEMP_FILE, apex);
      try {
        const result = execSync(`sf apex run --target-org ${org} --file ${TEMP_FILE} 2>&1`, { encoding: 'utf8', timeout: 30000 });
        const passed = result.includes('Compiled successfully') && result.includes('Executed successfully');
        if (passed) {
          totalPassed++;
          console.log(`  test[${i}]: ✅ PASS`);
        } else {
          console.log(`  test[${i}]: ❌ FAIL`);
          const errLines = result.split('\n').filter(l =>
            /error|assert|exception|duplicate|unexpected/i.test(l)
          );
          errLines.slice(0, 3).forEach(l => console.log(`    ${l.trim()}`));
          failures.push({ order: t.order, id, testIndex: i, req: reqs[i] || '' });
        }
      } catch (err) {
        console.log(`  test[${i}]: ❌ ERROR — ${err.message.substring(0, 150)}`);
        failures.push({ order: t.order, id, testIndex: i, req: reqs[i] || '' });
      }
    }
  }

  // Cleanup
  if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);

  // ===== SUMMARY =====
  console.log(`\n${'='.repeat(70)}`);
  console.log('\n=== SUMMARY ===\n');

  // Quality issues
  const issueCount = allIssues.reduce((sum, t) => sum + t.issues.length, 0);
  if (issueCount === 0) {
    console.log('Quality: ✅ ALL TASKS CLEAN');
  } else {
    console.log(`Quality: ${issueCount} issue(s) across ${allIssues.filter(t => t.issues.length > 0).length} task(s)`);
    allIssues.filter(t => t.issues.length > 0).forEach(t => {
      console.log(`  Task ${t.order} (${t.id}):`);
      t.issues.forEach(i => console.log(`    ${i}`));
    });
  }

  // Org test results
  console.log(`\nOrg tests: ${totalPassed}/${totalTests} passed`);
  if (failures.length > 0) {
    console.log('Failed:');
    failures.forEach(f => console.log(`  Task ${f.order} test[${f.testIndex}]: ${f.req}`));
  } else if (totalTests > 0) {
    console.log('✅ ALL ORG TESTS PASSED');
  }

  await client.close();
}

main().catch(console.error);
