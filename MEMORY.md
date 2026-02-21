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

### 5.6 Use .get() Instead of Bracket Notation for List Access
- ❌ `types[0]` — bracket notation works but is not best practice in Apex
- ✅ `types.get(0)` — best practice, use `.get()` for all List element access
- This applies to **solutions, templates, tests, and preCode** — anywhere Apex code is written

### 5.7 Description and Requirements Writing Rules

**Writing style:**
- Use simple, direct language - 5th grade grammar. No fluff, no filler.
- Use regular hyphens `-` not em dashes `—`. Em dashes look AI-generated.
- Don't mention internal implementation details the platform can't test (e.g., "calls getPokemon internally" - we can't verify what's called internally, so don't say it).
- Description must match what the student actually does. If the template already has the HTTP call done, don't describe the HTTP call as the task.
  - ❌ "Call the Pokemon API and extract the name" (student isn't calling the API - the template does that)
  - ✅ "Complete the code to extract the 'name' value from the pokemon map" (this is what the student actually writes)
- For orgCode:true tasks where the student writes everything, use "Create a ... class" or "Add a ... method" language.

**Description content rules:**
- **Never list requirements in the description.** The user already sees requirements as a separate checklist.
- **Descriptions should explain the task context:** what the method does, what data it works with, and where to find the data structure (e.g., API link).
- For API tasks, point users to the API URL so they can explore the JSON structure themselves (e.g., "You can explore the JSON structure at https://pokeapi.co/api/v2/pokemon/pikachu")
- **Break long descriptions into multiple paragraphs.** A single wall of text is hard to read on the platform. Use `\n\n` to separate logical sections (e.g., what to build, example JSON, hints).

**Requirements rules:**
- **Requirements should be concrete with input/output examples** rather than vague descriptions:
  - ❌ `"The method must return the 'name' value"` - too vague
  - ✅ `"If the input is '{\"name\":\"charizard\",\"weight\":905}' then getName must return 'charizard'"` - concrete, testable

### 5.8 No Comments in Public-Facing Code
- **Templates and solutions must NOT contain comments** unless the comment is part of the teaching process
- ✅ `// Write your code here` — teaching, guides the user
- ✅ `// pokemonName variable is already provided` — explains preCode context
- ❌ `// Create a new HttpRequest` — just describing what the code does, not teaching
- ❌ `// Extract name and height from the pokemon map` — freeform hint, not teaching
- Comments in **tests** are fine (not user-facing)

### 5.9 Platform Test Execution Model

> ⚠️ **This is one of the most important sections.** Understanding how the platform runs tests is essential for writing tasks that actually work. Getting this wrong causes compilation errors, false failures, or untestable tasks.

#### How Tests Run

The platform runs **each test individually as a separate API request** via Salesforce anonymous Apex. There is no batching — test[0] runs alone, then test[1] runs alone, etc.

The execution differs by `orgCode`:

**orgCode: false (website tasks):**
The user writes code in the website editor. For each test, the platform concatenates and sends:
```
preCode + userCode + test[i]
```
This entire block runs as one anonymous Apex execution. All three parts share the same scope — variables declared in preCode or userCode are visible in the test.

**orgCode: true (Salesforce org tasks):**
The user writes code in their Salesforce org (e.g., creates/modifies a class). For each test, the platform sends:
```
test[i]
```
Each test runs as anonymous Apex against the user's org, where the class already exists. The test instantiates the class, calls methods, and asserts on the results.

#### What the User Sees

- **Template** = starter code shown in the website editor. The user modifies it (fills blanks, adds code). The result after editing is what becomes `userCode`.
- **Requirements** = shown to the user as a checklist. Each requirement maps 1:1 to a test.
- **On failure:** The user sees the **requirement text** + the **error message** from the Assert. They do NOT see the test code itself.
- **On success:** The requirement shows as passed (green checkmark).

Since users see requirement text + error messages but NOT test code, write clear requirement strings and descriptive Assert messages.

#### Critical Rules for orgCode: false Tests

Since `preCode + userCode + test` all run in the same anonymous Apex scope:

1. **Tests must NEVER redeclare variables** that exist in userCode or preCode
   - If the user's code has `HttpRequest request = new HttpRequest();` and the test also declares `HttpRequest request = ...`, it throws **"Duplicate field: request"** compilation error
   - Tests should contain **ONLY assertion logic**

2. **Use preCode for shared setup that isn't part of the user's task**
   - preCode runs before EVERY test (it's prepended to each one)
   - Good for: providing variables the user needs, setting up context
   - Example: `String pokemonName = 'charizard';` in preCode if the task asks the user to use that variable

3. **Variables from userCode are visible in tests**
   - If the solution declares `String name = (String) pokemon.get('name');`, the test can just do `Assert.areEqual('pikachu', name, '...');`
   - No need to re-fetch, re-parse, or re-declare anything

4. **Each test runs independently with the SAME userCode**
   - test[0] gets: preCode + userCode + test[0]
   - test[1] gets: preCode + userCode + test[1]
   - This means ALL variables from userCode exist in every test
   - But test[0]'s variables are NOT visible in test[1] (they're separate executions)

**Example — WRONG (causes "Duplicate field" error):**
```
// userCode:  HttpRequest request = new HttpRequest();
// test[0]:   HttpRequest request = new HttpRequest();
//            Assert.isNotNull(request, 'must exist');
// Result:    Two declarations of 'request' → COMPILATION ERROR
```

**Example — CORRECT:**
```
// userCode:  HttpRequest request = new HttpRequest();
// test[0]:   Assert.isNotNull(request, 'HttpRequest must be created');
// Result:    test uses the variable from userCode → PASSES
```

**Example — preCode usage:**
```
// preCode:   String pokemonName = 'charizard';
// userCode:  request.setEndpoint('https://pokeapi.co/api/v2/pokemon/' + pokemonName);
// test[0]:   Assert.areEqual('https://pokeapi.co/api/v2/pokemon/charizard', request.getEndpoint(), '...');
// Result:    preCode provides the variable, userCode uses it, test asserts → PASSES
```

#### Critical Rules for orgCode: true Tests

Since tests run as standalone anonymous Apex against the deployed class:

1. **Tests must be fully self-contained** — they instantiate classes and call methods themselves
2. **No variable conflicts** — the test is the only code running, so declare whatever you need
3. **Test with multiple data points** — e.g., test with both 'pikachu' and 'charizard' to verify the code isn't hardcoded
4. **preCode role is unclear** — to be safe, assume tests must be fully self-contained for orgCode:true tasks

**Example — orgCode:true test:**
```
// test[0]: PokemonService service = new PokemonService();
//          Map<String, Object> result = service.getPokemon('pikachu');
//          Assert.areEqual('pikachu', (String) result.get('name'), 'getPokemon must return correct data');
```

#### How to Verify Tests Locally Before Inserting

To simulate what the platform does, use the Salesforce CLI:

**For orgCode:false tasks:**
```bash
# Simulate: preCode + solution + test[i]
echo "preCode here
solution here
test[i] here" | sf apex run --target-org trailhead 2>&1
```
Check for "Compiled successfully. Executed successfully."

**For orgCode:true tasks:**
```bash
# 1. Deploy the class to the org
cd /Users/igorkudryk/Salesforce/Projects/learn-apex-3
sf project deploy start --metadata ApexClass:ClassName --target-org trailhead --wait 5

# 2. Run each test as anonymous Apex
echo "test[i] code here" | sf apex run --target-org trailhead 2>&1
```

#### Task Placement: When a Task is "Too Basic" for a Topic

Tasks should match the topic's teaching focus. A task about `new HttpRequest()` belongs in the HTTP Request topic, not in the Pokemon API topic — even if it technically works. If a task doesn't use the topic's subject matter, consider moving it to the correct topic rather than deleting it.

### 5.10 LIMIT Values
- `LIMIT 0` makes no sense — use `LIMIT 1` at minimum
- Check all SOQL queries in solutions for sensible LIMIT values

### 5.11 Delta Field
The `delta` field is Quill.js rich text format. It must **match the description** field exactly:
```javascript
delta: [{ insert: description + '\n' }]
```
Always update `delta` when you update `description`.

### 5.12 Scheduled Job Tasks
For tasks that require scheduling a batch job from Setup:
- The requirement must specify the **exact job name** the user should enter
- The test queries `CronTrigger` by that specific name:
```java
List<CronTrigger> jobs = [SELECT Id FROM CronTrigger WHERE CronJobDetail.Name = 'Exact Job Name'];
Assert.isTrue(jobs.size() > 0, 'A scheduled job named Exact Job Name must exist');
```

### 5.13 testMode (Soft Delete)
- Never delete tasks from the database
- To hide a task, set `testMode: true`
- The user will delete tasks manually if needed

---

## 6. Workflow Rules

### 6.1 NEVER Write to Database Without Explicit Confirmation
> This is the #1 rule. The database is **live** — real users are affected.

- **ALWAYS show the user what you plan to insert/update FIRST** — present the data as a summary table or JSON overview
- **ALWAYS ask explicitly: "Should I run this now?"** — never assume
- **NEVER run an insert/update script immediately after writing it** — the script is for review, not for execution
- "Looks good" = the data looks correct. It is **NOT** permission to run.
- "Let's add them" = user approves the task content. It is **NOT** permission to execute against the database.
- "I love those tasks" = positive feedback on the design. It is **NOT** permission to insert.
- The ONLY valid confirmations to execute are responses to a direct "Should I run this now?" question, such as: "yes run it", "go ahead and insert", "deploy it", "execute the script"
- **Four-step workflow for creating new tasks:**
  1. Write the full task JSON and show it to the user for review
  2. **Verify every task against the trailhead org** using `sf apex run --target-org trailhead`:
     - For `orgCode: false` tasks: run the solution + tests as anonymous Apex (classes can be defined inline)
     - For `orgCode: true` tasks: deploy the solution class to the trailhead org via `learn-apex-3` project, run the tests as anonymous Apex, then leave the class (user uses this org for production testing)
     - Every single test must compile and pass — if any test fails, fix the task before presenting
  3. Present results to the user with pass/fail status for every task
  4. Ask "Should I insert into DB now?" → get explicit DB execution approval
- **Every batch must be reviewed separately** — never insert batch N+1 just because batch N was approved
- When in doubt, **always ask**. Never guess.

### 6.2 Salesforce CLI — Testing Tasks Against Trailhead Org
```bash
# Run anonymous Apex:
echo "your code here" | sf apex run --target-org trailhead 2>&1

# Parse debug output:
... | grep "USER_DEBUG"

# Parse errors:
... | grep -E "(FATAL|Error)"

# Deploy a class (via learn-apex-3 project):
cd /Users/igorkudryk/Salesforce/Projects/learn-apex-3
sf project deploy start --metadata ApexClass:ClassName --target-org trailhead --wait 5

# Note: CLI v2.60.13 has a cosmetic "Missing message metadata.transfer:Finalizing" error
# but the deploy actually succeeds — verify with anonymous Apex after deploying
```
- Org alias: `trailhead`
- Username: `kudryk@resilient-narwhal-cf5l8q.com`
- SFDX project: `/Users/igorkudryk/Salesforce/Projects/learn-apex-3/`
- Remote Site Setting for `https://pokeapi.co` is already configured
- **Do NOT delete classes from the org after testing** — user uses this org for production testing

### 6.3 Pre-flight Checks
Every migration script must include:
1. **Task existence check** — verify each task ID exists before modifying
2. **Req/test count validation** — ensure they'll be equal after changes
3. **System.debug check** — scan solutions for System.debug
4. **Abort on failure** — if any check fails, don't proceed

### 6.4 Verification After Migration
After every write operation, re-read the modified documents and verify:
- Req count = test count
- No System.debug in solutions
- Description and delta match
- orgCode is correct
- All IDs are correct types

### 6.5 Script Organization
All scripts are written in the working directory:
```
/Users/igorkudryk/Salesforce/JSProjects/mongodb-rework/
```

Scripts use the `mongodb` npm package (already installed).

### 6.6 MongoDB Atlas Connection Troubleshooting
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

### Migration 5: Pokemon API Topic — NEW topic + 25 tasks
- Created brand-new topic "Working with the Pokemon API" in the "Post Requests" lesson (`6970d1c20a6f66b9d8042fbd`)
- Topic ID: `6990bbd44dc3a532eb9ed4b0` | link: `pokemon-api` | wp_id: `10540` | order: 13
- Originally 25 tasks (orders 1-25), teaching HTTP callouts and JSON parsing using the Pokemon API
- Tasks progress from fill-in-the-blank HTTP basics → JSON parsing → methods/classes → full PokemonService capstone
- **Post-creation fixes applied:**
  - Removed task 1 (generic `new HttpRequest()` — too basic, doesn't use Pokemon API) → `testMode: true`
  - Fixed all orgCode:false tests (orders 2-14 had duplicate variable declarations causing "Duplicate field" errors)
  - Re-ordered remaining 24 tasks (1-24)
- Final structure (24 active tasks):
  - Orders 1-9: Fill-in-the-blank (setEndpoint, setMethod, http.send, getStatusCode, getBody, deserializeUntyped, cast to Map, extract name, extract weight)
  - Orders 10-13: Multi-field extraction, nested JSON navigation (name+height, base_experience, types list, nested type name)
  - Order 14: PokemonFetcher class (orgCode:true)
  - Orders 15-18: PokemonParser individual methods (orgCode:false, with templates)
  - Order 19: PokemonParser full class (orgCode:true)
  - Orders 20-23: PokemonService built incrementally (orgCode:true, each task only tests its NEW method)
  - Order 24: Capstone — full PokemonService tested with bulbasaur (orgCode:true, hard)
- Scripts: `insert-pokemon-api-topic.js`, `insert-pokemon-tasks-batch1.js` through `batch4.js`, `fix-pokemon-tests-and-reorder.js`
- JSON files: `pokemon-tasks-batch1.json` through `batch4.json`

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
10. **NEVER execute a DB script right after writing it.** The script is for the user to review. Always show the data first, then explicitly ask "Should I run this now?" before executing. Positive feedback like "looks good" or "I love those" is about the content, NOT permission to execute.
11. **Tests for orgCode:false tasks must NOT redeclare user variables.** The platform concatenates `preCode + userCode + test` — if both the user's code and the test declare the same variable (e.g., `HttpRequest request`), it throws "Duplicate field" compilation error. Tests should only contain assertions.
12. **Always verify tasks on the actual platform** — not just via CLI. The CLI tests the Apex logic, but the platform has its own concatenation model (`preCode + userCode + test`) that can surface issues the CLI won't catch (like duplicate variable names).
13. **Tasks must match their topic's teaching focus.** A generic `new HttpRequest()` task belongs in the HTTP Request topic, not in a Pokemon API topic. Move tasks to where they fit, don't just delete them.
14. **orgCode:false tests with classes work differently.** When the user's code defines a class (e.g., `public class PokemonParser { ... }`), the test instantiates it (`PokemonParser parser = new PokemonParser();`). This works in anonymous Apex and doesn't cause duplicate variable issues because the test uses a different variable name than anything in the class definition.
15. **Test with multiple data points for orgCode:true tasks.** Using only one test input (e.g., just 'pikachu') means the user could hardcode the answer. Test with at least 2 different inputs (e.g., pikachu + charizard) and use a completely different input for capstone tasks (e.g., bulbasaur).
16. **Each incremental task should only test its NEW method.** When tasks build on each other (e.g., PokemonService adding methods one by one), don't re-test methods from previous tasks — the user already proved those work. Only test the newly added method.
17. **Use `.get(0)` not `[0]` for List access in Apex.** Bracket notation works but `.get()` is best practice. Applies to solutions, templates, tests, and preCode.
18. **Write descriptions for what the student actually does, not the full code flow.** If the template already handles the HTTP call and deserialization, the task is "Complete the code to extract X" not "Call the API and extract X." Also don't mention untestable implementation details like "calls method X internally."
19. **Never use variable names that are Apex reserved words or shadow system classes.** `JSON`, `Http`, `System`, `Database`, `Test`, `Url`, `Type`, `Package`, `currency`, etc. are system classes or reserved identifiers. Using them as variable names causes compilation errors ("Identifier name is reserved" or "Method does not exist"). Use descriptive names instead: `jsonString`, `currencyData`, `httpClient`, etc. This applies to ALL code: tests, solutions, templates, and preCode.
20. **Some older topics store task IDs as ObjectIds, not strings.** Before pushing to a topic's tasks array, always check what type the existing entries use (`typeof` + `instanceof ObjectId`). Push the same type to avoid inconsistency. The rule "always push strings" only applies to topics we created/managed — older topics may use ObjectIds.
21. **System.debug in preCode also causes phantom requirements.** Not just in solutions — if the preCode contains a class with System.debug inside a method, the platform will detect it. Remove System.debug from preCode classes too.
22. **Ghost task IDs in topic arrays.** Topics can reference task IDs that don't exist in the tasks collection. This causes empty/broken views on the frontend. Fix by setting `tasks: []` on the topic. Always verify task IDs exist before assuming they're valid.
23. **Tasks must be in the right lesson for the curriculum order.** If a task requires concepts not yet taught (e.g., for loops in an if/else lesson), move it to the appropriate lesson/topic. Check lesson `order` field to verify curriculum sequence.
24. **Variable name typos between description and solution/tests break tasks.** If the description says `foodOccurrences` but tests check `foodOccurences`, the student's correct code fails. Always ensure variable names are consistent AND correctly spelled across description, solution, requirements, and tests.

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
   - [ ] `orgCode` — should it be `true`? (class/method tasks = yes, fill-in-blank = false)
   - [ ] Description language — "Write"/"Create" for orgCode:true, not "Complete"/"Fill in"
   - [ ] Template — empty for orgCode:true tasks; starter code for orgCode:false
   - [ ] Solution — no casting, no System.debug, no unnecessary comments
   - [ ] Requirements count = tests count
   - [ ] Tests for orgCode:false — assertion-only (no duplicate variable declarations)
   - [ ] Tests for orgCode:true — self-contained, multiple data points
   - [ ] SOQL queries have sensible LIMIT values
   - [ ] Orders are sequential (1, 2, 3...)
   - [ ] Delta matches description
   - [ ] Task belongs in this topic (matches the topic's teaching focus)
   - [ ] No comments in solutions/templates (unless teaching, e.g., `// Write your code here`)
3. **Verify every task against the trailhead org** — simulate `preCode + solution + test` for orgCode:false, deploy + run tests for orgCode:true
4. Present overview to user
5. **Wait for explicit confirmation**
6. Run migration with pre-flight checks
7. Verify after migration

---

## 13. Tally Feedback Form

The platform has a feedback form on Tally.so for bug reports and feature requests.

- **API Key:** `tly-KCOaa22uzMS7JzhhXuHZMHuekiQuKpjz`
- **Form ID:** `2ENWXp` (Feedback Form)
- **API endpoint:** `https://api.tally.so/forms/2ENWXp/submissions`
- **Auth:** `Authorization: Bearer <api_key>`
- **Categories:** Bug reports, feedback, help requests
- **Key question IDs:**
  - `RzD1Qv` — Category (bug/feedback/help)
  - `oA2YZ5` — Feedback text
  - `VZzXaN` — Bug description
  - `OA7KZk` — Bug category dropdown
  - `24KzYg` — Name
  - `xdJE7E` — Email
  - `EPxeGA` — Attachments

Use this to monitor user-reported bugs and check if they're real task issues or user errors.

**Not fixable via DB:** SOQL tasks (user confirmed), streak issues, "Something went wrong" app errors, WordPress/UI content issues, dark mode requests.

---

## 14. Feedback Fixes Completed

| Date | Reporter | Issue | Fix |
|---|---|---|---|
| Feb 17 | Ufuk | For loop task in if/else lesson (before loops taught) | Moved task to "Standard for loop" topic. Script: `fix-move-investment-task.js` |
| Feb 17 | Manish | Flowers task — System.debug phantom reqs, System.assertEquals | Removed System.debug from solution + preCode, updated test to Assert.areEqual. Script: `fix-flowers-task.js` |
| Feb 17 | Jace | `foodOccurences` typo — description says `foodOccurrences` but tests use misspelled version | Fixed to correct spelling `foodOccurrences` everywhere. Script: `fix-food-occurrences.js` |
| Feb 16 | *(anon)* | JSON.deserializeUntyped error on Parsing with maps | Not a bug — user error (likely shadowed JSON class) |
| Feb 18 | Oluwafemi | Cleared template code on Task 12 (Company constructor) | Not a DB bug — drafted response with template code |
