# MongoDB Task Rework - Project Instructions

> Long-term reference (migration history, topic/lesson IDs, Tally API): see `MEMORY.md`

## 1. Connection & Environment

- **DB:** `learn-apex` on MongoDB Atlas
- **Connection:** `mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority`
- **SFDX project:** `/Users/igorkudryk/Salesforce/Projects/learn-apex-3/`
- **Scripts dir:** `/Users/igorkudryk/Salesforce/JSProjects/mongodb-rework/`

### Orgs

| Alias | Username | Use for |
|---|---|---|
| `trailhead` | `kudryk@resilient-narwhal-cf5l8q.com` | Most tasks (Batch Apex, Pokemon API, etc.) |
| `Claude_Org` | `kudryk@wise-badger-94mfwi.com` | Nebula Logger / Integration module tasks |

---

## 2. Platform Test Execution

The platform runs each test individually as a separate anonymous Apex execution. No batching.

**orgCode: false (website tasks):** `preCode + userCode + test[i]`
- All three share the same scope - variables from preCode/userCode are visible in tests
- Tests must NOT redeclare variables from userCode (causes "Duplicate field" error)
- Tests should contain ONLY assertion logic
- preCode runs before every test - use it for shared setup

**orgCode: true (org tasks):** `preCode + test[i]`
- The user writes code in their Salesforce org (class/method)
- preCode runs before every test - use it for setup, calling methods, creating variables
- Tests are self-contained anonymous Apex against the deployed class
- Test with multiple data points to prevent hardcoding

### Local Verification

```bash
# orgCode:false - simulate preCode + solution + test[i]:
echo "preCode
solution
test[i]" | sf apex run --target-org <alias> 2>&1

# orgCode:true - deploy class, then run each test:
cd /Users/igorkudryk/Salesforce/Projects/learn-apex-3
sf project deploy start --metadata ApexClass:ClassName --target-org <alias> --wait 5
echo "test[i]" | sf apex run --target-org <alias> 2>&1
```

---

## 3. Task Quality Checklist

For each task, verify:
- [ ] `orgCode` correct (class/method tasks = true, fill-in-blank = false)
- [ ] Description uses "Write"/"Create" for orgCode:true, not "Complete"/"Fill in"
- [ ] Template is empty for orgCode:true; has starter code for orgCode:false
- [ ] Solution has no casting, no System.debug, no unnecessary comments
- [ ] `requirements.length === tests.length`
- [ ] Tests for orgCode:false are assertion-only (no duplicate variable declarations)
- [ ] Tests for orgCode:true are self-contained with multiple data points
- [ ] Uses `Assert` class, never `System.assert`
- [ ] Uses `.get(0)` not `[0]` for List access
- [ ] SOQL `LIMIT >= 1` (never LIMIT 0)
- [ ] `delta` matches `description` (`delta: [{ insert: description + '\n' }]`)
- [ ] `order` is sequential (1, 2, 3...)
- [ ] Task belongs in this topic (matches the topic's teaching focus)
- [ ] No Apex reserved words as variable names (`JSON`, `Http`, `System`, `Type`, etc.)
- [ ] Verify every task against the correct org before inserting

---

## 4. Task Document Structure

```javascript
{
  _id: ObjectId("..."),           // Unique task ID
  description: "...",             // Plain text description
  delta: [{ insert: "...\n" }],  // Quill.js rich text - must match description
  solution: "...",                // Correct Apex code solution
  template: "...",                // Starter code (empty for orgCode:true)
  preCode: "...",                 // Runs before each test
  requirements: ["...", "..."],   // Requirement strings (1:1 with tests)
  tests: ["...", "..."],          // Apex test code strings
  points: 10,                    // Point value
  difficulty: "easy|medium|hard",
  orgCode: true|false,
  testMode: true|false,          // true = hidden (soft delete)
  ref: "...",                    // String - parent topic ID
  order: 1                       // Display order within topic
}
```

---

## 5. Data Model & Type Rules

**Hierarchy:** Lessons -> Topics -> Tasks

| Field | Type | Note |
|---|---|---|
| `_id` (all collections) | `ObjectId` | Use `new ObjectId("...")` for queries |
| `ref` (in tasks) | `String` | Parent topic ID as plain string |
| `tasks` array (in topics) | `Array of Strings` | Push strings, NOT ObjectIds |

Some older topics store task IDs as ObjectIds - check existing entries before pushing.

---

## 6. Description & Requirements Writing

- Simple, direct language - 5th grade grammar. No fluff.
- Regular hyphens `-`, not em dashes. Em dashes look AI-generated.
- Never list requirements in the description (user sees them as a separate checklist)
- Description explains context: what the method does, what data it works with
- Requirements must be concrete with input/output examples, not vague descriptions
- Break long descriptions into multiple paragraphs (`\n\n`)
- Describe what the student actually does, not the full code flow
- No comments in templates/solutions unless teaching (e.g., `// Write your code here`)

---

## 7. Workflow Rules

**NEVER write to DB without explicit confirmation.** The database is live.

1. Write the full task JSON and show it for review
2. Verify every task against the org using `sf apex run`
3. Present results with pass/fail status
4. Ask "Should I insert into DB now?" and wait for explicit confirmation
   - "Looks good" / "I love those" = feedback on content, NOT permission to execute

**Pre-flight checks** (every script):
- Task existence check (verify IDs exist)
- Req/test count validation
- System.debug check in solutions AND preCode
- Abort on any failure

**Post-write verification:** Re-read documents and verify req=test count, no System.debug, delta matches description.

---

## 8. Salesforce Gotchas

- **Empty strings -> null:** SF stores `''` as `null` for custom text fields. Use `String.isBlank()` instead of `Assert.areEqual('', value)`
- **No callouts after DML:** Can't do HTTP callouts after DML in the same transaction. Error: "You have uncommitted work pending"
- **TEXTAREA not filterable:** Fields like `LogEntry__c.Message__c` can't be used in SOQL WHERE. Query by other fields, check in Apex loops
- **Nebula Logger async by default:** Use `Logger.saveLog(Logger.SaveMethod.SYNCHRONOUS_DML)` - default EVENT_BUS is async
- **Batchable not in anonymous Apex:** Tasks requiring a batch class must be orgCode:true
- **testMode for soft delete:** Set `testMode: true` to hide a task. Never delete from DB.

---

## 9. Work Completed

| Module | Status |
|---|---|
| Batch Apex (all topics) | Done - 8 migrations |
| Pokemon API (25 tasks) | Done - topic created, tests fixed |
| Simple-logging (5 tasks) | Done - Task 3 & 5 fixed |
| Nebula Logger (15 tasks) | Done - full rewrite |
| HMAC (6 tasks) | Done - orders set |
| Feedback fixes (Ufuk, Manish, Jace) | Done |
