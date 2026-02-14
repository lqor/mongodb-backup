# MongoDB Task Rework — Session Memory

> **Purpose:** Bootstrap any new Claude session to understand the database, the platform rules, and the workflow for modifying tasks. Read this file before doing anything.

---

## 1. Connection & Database Overview

### Connection String
```
mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority
```

### Databases
| Database | Description |
|---|---|
| `learn-apex` | **Main database** — Salesforce Apex learning platform. ~813 tasks, ~178 topics, ~31 lessons |
| `learn-lwc` | LWC learning platform. 8 tasks. Hierarchy: modules → lessons → topics → tasks |
| `lwc-mastery-cohort` | LWC cohort platform. 77 tasks. Flat structure by week |
| `db-contacts` | Contacts database. Not related to tasks |

### Backup
A full backup of all 4 databases (11,527 documents) was pushed to:
**https://github.com/lqor/mongodb-backup.git**

---

## 2. Data Hierarchy (learn-apex)

```
Lessons → Topics → Tasks
```

- A **Lesson** contains an array of topic IDs
- A **Topic** contains an array of task IDs (as **strings**)
- A **Task** has a `ref` field pointing to its parent topic ID (as a **string**)

---

## 3. Critical Data Type Rules

> ⚠️ **These were learned the hard way — getting them wrong breaks the database.**

| Field | Type | Example |
|---|---|---|
| `_id` (in all collections) | `ObjectId` | Must use `new ObjectId("...")` for queries |
| `ref` (in tasks) | `String` | Points to the topic `_id`. Use as a plain string, NOT ObjectId |
| `tasks` array (in topics) | `Array of Strings` | e.g. `["696cf7a7fab54be63ea3d314", "696cf7a7fab54be63ea3d315"]` |

### Common Mistakes to Avoid
- **DO NOT** use `new ObjectId()` when pushing to a topic's `tasks` array — use plain strings
- **DO NOT** use string IDs for `_id` queries — use `new ObjectId(id)`
- If you add tasks to a topic's `tasks` array, they must be **strings**, matching the existing format

---

## 4. Task Document Structure

```javascript
{
  _id: ObjectId("..."),           // Unique task ID
  description: "...",             // Plain text description shown to user
  delta: [{ insert: "...\n" }],  // Quill.js rich text format — must match description
  solution: "...",                // The correct Apex code solution
  template: "...",                // Code template shown to user (or empty for orgCode tasks)
  preCode: "...",                 // Code that exists in the org before the task (context)
  requirements: ["...", "..."],   // Array of requirement strings
  tests: ["...", "..."],          // Array of Apex test code strings
  points: 10,                    // Point value
  difficulty: "easy|medium|hard", // Difficulty level
  orgCode: true|false,           // Whether task must be written in Salesforce org
  testMode: true|false,          // If true, task is hidden (soft delete)
  ref: "...",                    // String — parent topic ID
  order: 1                       // Display order within the topic
}
```

---

## 5. Task Modification Rules

### 5.1 orgCode Tasks (orgCode: true)
These are tasks where the user writes code **in their Salesforce org**, not on the website.

- **Template** must be `""` (empty string) or `"// Write your code here"`
  - NEVER include code skeletons/scaffolding — the user writes everything in their org
- **Description** must use **"Write"** / **"Create"** language
  - ❌ "Complete the method...", "Fill in the blanks..."
  - ✅ "Write a batch class...", "Create a method that..."

### 5.2 No Casting
The `execute` method parameter should use the **typed list directly**, not cast from `List<sObject>`.

- ❌ `public void execute(Database.BatchableContext context, List<sObject> scope) { List<Account> accounts = (List<Account>) scope; ... }`
- ✅ `public void execute(Database.BatchableContext context, List<Account> scope) { ... }`

This applies to both `solution` and `description`/`requirements`.

### 5.3 Requirements Count = Tests Count
The number of items in the `requirements` array **must always equal** the number of items in the `tests` array. One requirement maps to one test.

### 5.4 No System.debug in Solutions
The platform engine automatically generates a requirement for every `System.debug` found in the solution. This creates phantom/extra requirements that break the req/test count balance.

- **Always remove** `System.debug(...)` lines from solutions
- If the task genuinely needs debug output, handle it differently

### 5.5 Always Use Assert Class, Never System.assert
- ❌ `System.assert(condition)`, `System.assertEquals(...)`, `System.assertNotEquals(...)`
- ✅ `Assert.isTrue(condition, 'message')`, `Assert.areEqual(expected, actual, 'message')`, `Assert.isNotNull(value, 'message')`

The `Assert` class is the modern Salesforce approach. Never use `System.assert` in solutions or tests.

### 5.6 LIMIT Values
- `LIMIT 0` makes no sense — use `LIMIT 1` at minimum
- Check all SOQL queries in solutions for sensible LIMIT values

### 5.7 Delta Field
The `delta` field is Quill.js rich text format. It must **match the description** field exactly:
```javascript
delta: [{ insert: description + '\n' }]
```
Always update `delta` when you update `description`.

### 5.8 Scheduled Job Tasks
For tasks that require scheduling a batch job from Setup:
- The requirement must specify the **exact job name** the user should enter
- The test queries `CronTrigger` by that specific name:
```java
List<CronTrigger> jobs = [SELECT Id FROM CronTrigger WHERE CronJobDetail.Name = 'Exact Job Name'];
Assert.isTrue(jobs.size() > 0, 'A scheduled job named Exact Job Name must exist');
```

### 5.9 testMode (Soft Delete)
- Never delete tasks from the database
- To hide a task, set `testMode: true`
- The user will delete tasks manually if needed

---

## 6. Workflow Rules

### 6.1 NEVER Write to Database Without Explicit Confirmation
> This is the #1 rule. The database is **live** — real users are affected.

- Always show the user what you plan to change (overview first)
- Wait for an explicit "go ahead", "let's go", "run it", etc.
- "Looks good" by itself is NOT confirmation to run — it may just mean the overview looks good
- When in doubt, ask: "Should I run this now?"

### 6.2 Pre-flight Checks
Every migration script must include:
1. **Task existence check** — verify each task ID exists before modifying
2. **Req/test count validation** — ensure they'll be equal after changes
3. **System.debug check** — scan solutions for System.debug
4. **Abort on failure** — if any check fails, don't proceed

### 6.3 Verification After Migration
After every write operation, re-read the modified documents and verify:
- Req count = test count
- No System.debug in solutions
- Description and delta match
- orgCode is correct
- All IDs are correct types

### 6.4 Script Organization
All scripts are written in the working directory:
```
/Users/igorkudryk/.claude-worktrees/mongodb-rework/keen-visvesvaraya/
```

Scripts use the `mongodb` npm package (already installed).

### 6.5 MongoDB Atlas Connection Troubleshooting
If the connection times out (`Server selection timed out after 30000 ms`), it's likely an **IP allowlist issue** on MongoDB Atlas. The cluster only accepts connections from whitelisted IPs.

- **Fix:** Switch to phone hotspot (the phone IP is already whitelisted), or go to Atlas dashboard → **Network Access** → **Add IP Address** and add the current IP
- **Check current IP:** `curl -s ifconfig.me`
- Public WiFi networks will have different IPs that are likely not on the allowlist
- The phone hotspot IP (`2a02:3033:...`) has been confirmed to work

---

## 7. Batch Apex Lesson Structure

**Lesson:** "Batch Apex" (ID: `6969339bd331617a8ce8abd0`)

| Topic | ID | Status |
|---|---|---|
| What is Batch Apex | `69693440d331617a8ce8abd2` | — |
| Batch Apex Structure | `69693440d331617a8ce8abd3` | — |
| The Batchable Interface | `69693440d331617a8ce8abd4` | Emptied (tasks moved to Execute Method) |
| The Start Method | `69693440d331617a8ce8abd5` | 0 tasks |
| The Execute Method | `69693440d331617a8ce8abd6` | 16 tasks (orders 1-16) — fully reworked |
| Running a Batch Job | `69693440d331617a8ce8abd7` | User deleted problematic tasks |
| Batch Apex and Scheduled | `69693440d331617a8ce8abd8` | 3 tasks remain — reworked with CronTrigger tests |
| Testing Batch Class | `69693440d331617a8ce8abd9` | 3 tasks (orders 1-3) — newly created |

---

## 8. Work Completed

### Migration 1: Batchable Interface → Execute Method (6 tasks)
- Moved 6 tasks from "The Batchable Interface" topic to "The Execute Method" topic
- Changed: orgCode false→true, ref updated, template cleared, descriptions rewritten (Complete→Write), removed casting from solutions, removed System.debug, fixed LIMIT 0→1, set orders 1-6

### Migration 2: Execute Method existing tasks (10 tasks)
- Fixed 10 existing Execute Method tasks
- Tasks d309-d30f: changed orgCode false→true, set orders 7-13
- Tasks d310-d312: already orgCode true, just set orders 14-16
- Tasks d309, d30a: also rewrote descriptions (Complete→Write language)

### Migration 3: Scheduled batch tasks (3 tasks)
- Updated tasks d31a, d31d, d31e in "Batch Apex and Scheduled" topic
- Added specific job names to requirement 7 (e.g., "Inactive Account Scheduler")
- Replaced generic/weak CronTrigger tests with name-specific queries
- Updated descriptions and deltas to match

### Migration 4: Testing Batch Class — NEW tasks (3 tasks)
- Created 3 brand-new tasks for the empty "Testing Batch Class" topic (`69693440d331617a8ce8abd9`)
- These tasks teach users how to write test classes for batch Apex
- Testing approach: query `ApexClass.Body` via SOQL to verify the user's test class structure (contains `@isTest`, `Test.startTest()`, `Test.stopTest()`, `Database.executeBatch`, `Assert.`)
- Task IDs: `6990789b4b9088be3d92b3b2` (order 1), `6990789b4b9088be3d92b3b3` (order 2), `6990789b4b9088be3d92b3b4` (order 3)
- Task 1 (easy): AccountDescriptionBatchTest — basic test class with `@isTest`, insert data, run batch, assert
- Task 2 (medium): ContactCleanupBatchTest — uses `@testSetup` for data creation, bulk testing with 5 records
- Task 3 (easy): LeadStatusBatchTest — tests batch execution with custom batch size of 50
- All `orgCode: true`, empty templates, no System.debug, no System.assert (uses Assert class only)
- Task IDs pushed to topic as strings ✅
- Script: `insert-testing-batch-tasks.js` | JSON: `new-tasks-testing-batch.json`

### User manual actions
- User deleted 3 fill-in-the-blank tasks from "Running a Batch Job" (d314, d315, d316)
- User deleted or set testMode on 2 overlapping tasks (d317, d318)
- User removed a mismatched requirement from tasks d31b, d31c
- User deleted tasks d31b, d31c (JunkLeadCleanupBatch, OverdueOpportunityBatch)
- User fixed topic tasks array format (ObjectId→string) after Migration 1

---

## 9. Common Patterns for Migration Scripts

```javascript
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');

  // PRE-FLIGHT: Verify task exists
  const task = await tasks.findOne({ _id: new ObjectId('...') });
  if (!task) { console.log('Task not found!'); return; }

  // PRE-FLIGHT: Check req/test count will match
  // PRE-FLIGHT: Check no System.debug in new solution

  // APPLY changes
  await tasks.updateOne(
    { _id: new ObjectId('...') },
    { $set: { /* fields */ } }
  );

  // VERIFY: Re-read and check
  const updated = await tasks.findOne({ _id: new ObjectId('...') });
  console.log(`Reqs: ${updated.requirements.length}, Tests: ${updated.tests.length}`);

  // TOPIC UPDATE (if moving tasks between topics):
  // Push as STRING, not ObjectId!
  // await topics.updateOne(
  //   { _id: new ObjectId('topicId') },
  //   { $push: { tasks: 'taskIdAsString' } }
  // );

  await client.close();
}

main().catch(console.error);
```

---

## 10. Lessons Learned (Mistakes to Never Repeat)

1. **Don't run scripts without explicit user confirmation.** "Looks good" ≠ "run it"
2. **Topic tasks arrays contain strings, not ObjectIds.** Pushing ObjectIds creates inconsistent data
3. **Always use `new ObjectId(id)` for `_id` queries.** String IDs return null
4. **There is no `lessonRef` field in tasks.** Tasks connect to topics via `ref`, not to lessons
5. **Helper method signatures like `List<Account>` are NOT casting.** Don't flag them as issues
6. **LIMIT 0 is nonsensical** in SOQL — always use at least LIMIT 1
7. **The platform auto-generates requirements for System.debug** found in solutions — this breaks req/test count
8. **Always update delta when updating description** — they must stay in sync
9. **Always verify after writing** — re-read the document and check it

---

## 11. Salesforce Anonymous Apex Limitations

> **Tested and confirmed** — this determines whether a task can be `orgCode: false` (website) or must be `orgCode: true` (written in org).

### What CANNOT be defined in Anonymous Apex
- **`Database.Batchable<sObject>`** — ❌ Error: "Only top-level classes can implement Database.Batchable<SObject>"
  - Any task that requires the user to **write a batch class** must be `orgCode: true`
  - Tasks that only **execute** an already-existing batch class (via `Database.executeBatch()`) can be `orgCode: false` with a template

### What CAN be defined in Anonymous Apex
- **`Queueable`** — ✅ Works in anonymous Apex
  - Queueable tasks could potentially work as website tasks with templates (`orgCode: false`)

### Decision Matrix
| Task requires... | orgCode | Reason |
|---|---|---|
| Writing a new Batch class | `true` | Can't define Batchable in anonymous Apex |
| Only executing an existing Batch class | `false` (with template) | Just calling `Database.executeBatch()` works fine |
| Writing a Queueable class | `false` (could work) | Queueable can be defined in anonymous Apex |
| Writing a Schedulable class | `true` (to be safe) | Not yet tested — assume same as Batchable |

### Impact on Past Decisions
- The deleted "Running a Batch Job" execute-only tasks (d314, d315, d316) could have stayed as `orgCode: false` website tasks — they only called `Database.executeBatch()` on pre-existing classes. However, they were redundant with Execute Method tasks.
- All "write a batch class" tasks correctly needed `orgCode: true`.

---

## 12. Quick Reference: How to Analyze a Topic's Tasks

1. Query all tasks with `ref` matching the topic ID
2. For each task, check:
   - [ ] `orgCode` — should it be `true`? (Apex tasks = yes)
   - [ ] Description language — "Write"/"Create", not "Complete"/"Fill in"
   - [ ] Template — empty for orgCode tasks
   - [ ] Solution — no casting, no System.debug
   - [ ] Requirements count = tests count
   - [ ] SOQL queries have sensible LIMIT values
   - [ ] Orders are sequential (1, 2, 3...)
   - [ ] Delta matches description
3. Present overview to user
4. **Wait for explicit confirmation**
5. Run migration with pre-flight checks
6. Verify after migration
