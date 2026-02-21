const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const TOPIC_ID = '6970d58b0a6f66b9d8042fcb';

// ============================================================
// STEP 1: Assign order 1-20 based on topic.tasks array order
// STEP 2: Set orgCode: false explicitly on tasks 1-16
// STEP 3: Rename String json → String jsonString in tests (tasks 5-20)
// STEP 4: Rewrite descriptions (tasks 5-20) — remove method signatures, requirements lists, em dashes
// STEP 5: Rewrite requirements (tasks 5-20) — concrete input/output examples
// STEP 6: Update deltas to match new descriptions
// STEP 7: Add second test input for AccountBuilder (task 20)
// ============================================================

function fixJsonVarInTest(test) {
  return test
    .replace(/\bString json\b/g, 'String jsonString')
    .replace(/\(json\)/g, '(jsonString)');
}

const TASK_UPDATES = {
  // Task 5 - CustomerService.extractName
  '697104440a6f66b9d8043021': {
    description: "Create a CustomerService class with an extractName method. The method takes a JSON string like '{\"name\": \"John Doe\", \"email\": \"john@example.com\"}' and returns the 'name' value as a String.",
    requirements: [
      "If the input is '{\"name\": \"John Doe\", \"email\": \"john@example.com\"}' then extractName must return 'John Doe'",
      "If the input is '{\"name\": \"Jane Smith\", \"age\": 30}' then extractName must return 'Jane Smith'",
      "If the input is '{\"name\": \"Acme Corp\", \"industry\": \"Technology\"}' then extractName must return 'Acme Corp'"
    ]
  },
  // Task 6 - CustomerService.extractEmail
  '697104440a6f66b9d8043022': {
    description: "Create a CustomerService class with an extractEmail method. The method takes a JSON string like '{\"name\": \"John\", \"email\": \"john@example.com\"}' and returns the 'email' value as a String.",
    requirements: [
      "If the input is '{\"name\": \"John\", \"email\": \"john@example.com\"}' then extractEmail must return 'john@example.com'",
      "If the input is '{\"name\": \"Jane\", \"email\": \"jane@test.com\"}' then extractEmail must return 'jane@test.com'",
      "If the input is '{\"name\": \"Acme\", \"email\": \"info@acme.com\"}' then extractEmail must return 'info@acme.com'"
    ]
  },
  // Task 7 - PaymentService.extractAmount
  '697104440a6f66b9d8043023': {
    description: "Create a PaymentService class with an extractAmount method. The method takes a JSON string like '{\"id\": \"PAY-123\", \"amount\": 99.99}' and returns the 'amount' value as a Decimal.",
    requirements: [
      "If the input has amount 99.99 then extractAmount must return 99.99",
      "If the input has amount 1234.56 then extractAmount must return 1234.56",
      "If the input has amount 50.00 then extractAmount must return 50.00"
    ]
  },
  // Task 8 - CustomerService.formatCustomerInfo
  '697104440a6f66b9d8043024': {
    description: "Create a CustomerService class with a formatCustomerInfo method. The method takes a JSON string with 'name' and 'email' fields and returns them combined in the format 'Name (email)'. For example, '{\"name\": \"John Doe\", \"email\": \"john@example.com\"}' should return 'John Doe (john@example.com)'.",
    requirements: [
      "If the input is '{\"name\": \"John Doe\", \"email\": \"john@example.com\"}' then formatCustomerInfo must return 'John Doe (john@example.com)'",
      "If the input is '{\"name\": \"Jane Smith\", \"email\": \"jane@test.com\"}' then formatCustomerInfo must return 'Jane Smith (jane@test.com)'"
    ]
  },
  // Task 9 - CustomerService.extractLastName
  '697104440a6f66b9d8043025': {
    description: "Create a CustomerService class with an extractLastName method. The method takes a JSON string with a 'name' field containing a full name like 'John Doe' and returns only the last name. Hint: use the String split method to separate by space, then get the second element.",
    requirements: [
      "If the name is 'John Doe' then extractLastName must return 'Doe'",
      "If the name is 'Jane Smith' then extractLastName must return 'Smith'",
      "If the name is 'Bob Johnson' then extractLastName must return 'Johnson'"
    ]
  },
  // Task 10 - ContactService.createContactFromJson
  '697104440a6f66b9d8043026': {
    description: "Create a ContactService class with a createContactFromJson method. The method takes a JSON string like '{\"id\": \"cus_123\", \"name\": \"John Doe\", \"email\": \"john@example.com\"}', parses it, and returns a new Contact object with LastName set to the last name from the 'name' field and Email set to the 'email' field. Do not insert the Contact.",
    requirements: [
      "If the name is 'John Doe' then Contact.LastName must be 'Doe'",
      "If the email is 'john@example.com' then Contact.Email must be 'john@example.com'",
      "If the name is 'Jane Smith' then Contact.LastName must be 'Smith'"
    ]
  },
  // Task 11 - ProductService.extractPrice
  '697106a20a6f66b9d8043028': {
    description: "Create a ProductService class with an extractPrice method. The method takes a JSON string like '{\"id\": \"PROD-001\", \"name\": \"Laptop\", \"price\": 999.99, \"inStock\": true}' and returns the 'price' value as a Decimal.",
    requirements: [
      "If the input has price 999.99 then extractPrice must return 999.99",
      "If the input has price 49.99 then extractPrice must return 49.99",
      "If the input has price 1499.00 then extractPrice must return 1499.00"
    ]
  },
  // Task 12 - InventoryService.isInStock
  '697106a20a6f66b9d8043029': {
    description: "Create an InventoryService class with an isInStock method. The method takes a JSON string like '{\"id\": \"PROD-001\", \"name\": \"Laptop\", \"price\": 999.99, \"inStock\": true}' and returns the 'inStock' value as a Boolean.",
    requirements: [
      "If inStock is true then isInStock must return true",
      "If inStock is false then isInStock must return false"
    ]
  },
  // Task 13 - UserService.hasMiddleName
  '697106a20a6f66b9d804302a': {
    description: "Create a UserService class with a hasMiddleName method. The method takes a JSON string like '{\"firstName\": \"John\", \"middleName\": null, \"lastName\": \"Doe\"}' and returns true if the 'middleName' field is NOT null, false if it IS null.",
    requirements: [
      "If middleName is null then hasMiddleName must return false",
      "If middleName is 'Robert' then hasMiddleName must return true"
    ]
  },
  // Task 14 - OrderService.getFirstItem
  '697106a20a6f66b9d804302b': {
    description: "Create an OrderService class with a getFirstItem method. JSON can contain arrays, which are parsed as List<Object>. The method takes a JSON string with an 'items' array like '{\"orderId\": \"ORD-001\", \"items\": [\"Laptop\", \"Mouse\", \"Keyboard\"]}' and returns the first item as a String. Hint: cast the 'items' value to List<Object>, then get the first element.",
    requirements: [
      "If items are ['Laptop', 'Mouse', 'Keyboard'] then getFirstItem must return 'Laptop'",
      "If items are ['Phone', 'Case'] then getFirstItem must return 'Phone'",
      "If items are ['Book'] then getFirstItem must return 'Book'"
    ]
  },
  // Task 15 - OrderService.countItems
  '697106a20a6f66b9d804302c': {
    description: "Create an OrderService class with a countItems method. The method takes a JSON string with an 'items' array and returns the number of items in the array as an Integer.",
    requirements: [
      "If items are ['Laptop', 'Mouse', 'Keyboard'] then countItems must return 3",
      "If items are ['Phone', 'Case'] then countItems must return 2",
      "If items are ['Book'] then countItems must return 1"
    ]
  },
  // Task 16 - AddressService.extractCity
  '697106a20a6f66b9d804302d': {
    description: "Create an AddressService class with an extractCity method. The method takes a JSON string with a nested 'address' object like '{\"name\": \"John\", \"address\": {\"street\": \"123 Main St\", \"city\": \"Springfield\", \"zip\": \"12345\"}}' and returns the 'city' value from inside the address. Hint: first get 'address' and cast it to Map<String, Object>, then get 'city' from that map.",
    requirements: [
      "If the address city is 'Springfield' then extractCity must return 'Springfield'",
      "If the address city is 'New York' then extractCity must return 'New York'",
      "If the address city is 'Los Angeles' then extractCity must return 'Los Angeles'"
    ]
  },
  // Task 17 - ProductDataService (orgCode: true)
  '697106a20a6f66b9d804302e': {
    description: "Create a ProductDataService class in your org with two methods: extractName that returns the 'name' field as a String, and extractInStock that returns the 'inStock' field as a Boolean. Both methods take a JSON string as a parameter. Example JSON: '{\"id\": \"PROD-001\", \"name\": \"Wireless Mouse\", \"price\": 29.99, \"inStock\": true}'.",
    requirements: [
      "The ProductDataService class must exist in the org",
      "If the input has name 'Wireless Mouse' then extractName must return 'Wireless Mouse'",
      "If inStock is true then extractInStock must return true",
      "If inStock is false then extractInStock must return false"
    ]
  },
  // Task 18 - InvoiceProcessor (orgCode: true)
  '697106a20a6f66b9d804302f': {
    description: "Create an InvoiceProcessor class in your org with three methods: getInvoiceId returns the 'invoiceId' as a String, getTotal returns the 'total' as a Decimal, and getLineItemCount returns the number of items in the 'lineItems' array as an Integer. All methods take a JSON string as a parameter. Example JSON: '{\"invoiceId\": \"INV-2024-001\", \"total\": 1250.00, \"paid\": false, \"lineItems\": [\"Service A\", \"Service B\", \"Service C\"]}'.",
    requirements: [
      "The InvoiceProcessor class must exist in the org",
      "If invoiceId is 'INV-2024-001' then getInvoiceId must return 'INV-2024-001'",
      "If total is 1250.00 then getTotal must return 1250.00",
      "If lineItems has 3 items then getLineItemCount must return 3",
      "If lineItems has 1 item then getLineItemCount must return 1"
    ]
  },
  // Task 19 - EmployeeParser (orgCode: true)
  '697106a20a6f66b9d8043030': {
    description: "Create an EmployeeParser class in your org with four methods that handle different JSON types: getEmployeeId returns 'employeeId' as a String, getSalary returns 'salary' as a Decimal, isActive returns 'active' as a Boolean, and hasDepartment returns true if 'department' is NOT null. All methods take a JSON string as a parameter. Example JSON: '{\"employeeId\": \"EMP-001\", \"salary\": 75000.00, \"active\": true, \"department\": null}'.",
    requirements: [
      "The EmployeeParser class must exist in the org",
      "If employeeId is 'EMP-001' then getEmployeeId must return 'EMP-001'",
      "If salary is 75000.00 then getSalary must return 75000.00",
      "If active is true then isActive must return true",
      "If department is null then hasDepartment must return false",
      "If department is 'Engineering' then hasDepartment must return true"
    ]
  },
  // Task 20 - AccountBuilder (orgCode: true) — adding 6th test with different data
  '697106a20a6f66b9d8043031': {
    description: "Create an AccountBuilder class in your org with a buildAccount method. The method takes a JSON string, parses it, and returns a new Account object (do not insert it). Set Name from 'companyName', Website from 'website', AnnualRevenue from 'revenue', and NumberOfEmployees from 'employees'. Example JSON: '{\"companyName\": \"Acme Corp\", \"website\": \"www.acme.com\", \"revenue\": 5000000.00, \"employees\": 250}'.",
    requirements: [
      "The AccountBuilder class must exist in the org",
      "If companyName is 'Acme Corp' then Account.Name must be 'Acme Corp'",
      "If website is 'www.acme.com' then Account.Website must be 'www.acme.com'",
      "If revenue is 5000000.00 then Account.AnnualRevenue must be 5000000.00",
      "If employees is 250 then Account.NumberOfEmployees must be 250",
      "buildAccount must work with different JSON data"
    ],
    // Replace all tests — fix json var + add 6th test with different data
    newTests: [
      "AccountBuilder builder = new AccountBuilder();\nAssert.isNotNull(builder, 'AccountBuilder class must exist');",
      "AccountBuilder builder = new AccountBuilder();\nString jsonString = '{\"companyName\": \"Acme Corp\", \"website\": \"www.acme.com\", \"revenue\": 5000000.00, \"employees\": 250}';\nAccount result = builder.buildAccount(jsonString);\nAssert.areEqual('Acme Corp', result.Name, 'Name should be Acme Corp');",
      "AccountBuilder builder = new AccountBuilder();\nString jsonString = '{\"companyName\": \"Acme Corp\", \"website\": \"www.acme.com\", \"revenue\": 5000000.00, \"employees\": 250}';\nAccount result = builder.buildAccount(jsonString);\nAssert.areEqual('www.acme.com', result.Website, 'Website should be www.acme.com');",
      "AccountBuilder builder = new AccountBuilder();\nString jsonString = '{\"companyName\": \"Acme Corp\", \"website\": \"www.acme.com\", \"revenue\": 5000000.00, \"employees\": 250}';\nAccount result = builder.buildAccount(jsonString);\nAssert.areEqual(5000000.00, result.AnnualRevenue, 'AnnualRevenue should be 5000000.00');",
      "AccountBuilder builder = new AccountBuilder();\nString jsonString = '{\"companyName\": \"Acme Corp\", \"website\": \"www.acme.com\", \"revenue\": 5000000.00, \"employees\": 250}';\nAccount result = builder.buildAccount(jsonString);\nAssert.areEqual(250, result.NumberOfEmployees, 'NumberOfEmployees should be 250');",
      "AccountBuilder builder = new AccountBuilder();\nString jsonString = '{\"companyName\": \"Globex Inc\", \"website\": \"www.globex.com\", \"revenue\": 1200000.00, \"employees\": 80}';\nAccount result = builder.buildAccount(jsonString);\nAssert.areEqual('Globex Inc', result.Name, 'buildAccount must work with different JSON data');"
    ]
  }
};

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');
  const topics = db.collection('topics');

  const topic = await topics.findOne({ _id: new ObjectId(TOPIC_ID) });
  const taskIds = topic.tasks; // string array in display order

  console.log('========== PRE-FLIGHT CHECKS ==========\n');
  console.log(`Topic: ${topic.topicName} | ${taskIds.length} tasks in topic array\n`);

  // Verify all task IDs exist
  for (let i = 0; i < taskIds.length; i++) {
    const t = await tasks.findOne({ _id: new ObjectId(taskIds[i]) });
    if (!t) {
      console.log(`❌ Task ${i + 1} (${taskIds[i]}) not found!`);
      await client.close();
      return;
    }

    const update = TASK_UPDATES[taskIds[i]];
    if (update) {
      // Check req/test count
      const expectedTestCount = update.newTests ? update.newTests.length : t.tests.length;
      if (update.requirements.length !== expectedTestCount) {
        console.log(`❌ Task ${i + 1} (${taskIds[i]}): new req count ${update.requirements.length} != test count ${expectedTestCount}`);
        await client.close();
        return;
      }
      console.log(`✅ Task ${i + 1} (${taskIds[i]}): ${update.requirements.length} reqs = ${expectedTestCount} tests${update.newTests ? ' (new tests)' : ''}`);
    } else {
      console.log(`✅ Task ${i + 1} (${taskIds[i]}): no content changes (order + orgCode only)`);
    }
  }

  console.log(`\n✅ All ${taskIds.length} tasks validated\n`);

  console.log('========== STEP 1: ASSIGN ORDER 1-20 ==========\n');

  for (let i = 0; i < taskIds.length; i++) {
    const order = i + 1;
    const result = await tasks.updateOne(
      { _id: new ObjectId(taskIds[i]) },
      { $set: { order: order } }
    );
    console.log(`  Task ${order}: ${result.modifiedCount === 1 ? '✅ order set' : '⚠️  no change'}`);
  }

  console.log('\n========== STEP 2: SET orgCode: false ON TASKS 1-16 ==========\n');

  for (let i = 0; i < 16; i++) {
    const result = await tasks.updateOne(
      { _id: new ObjectId(taskIds[i]) },
      { $set: { orgCode: false } }
    );
    console.log(`  Task ${i + 1}: ${result.modifiedCount === 1 ? '✅ orgCode set to false' : '⚠️  no change (may already be false)'}`);
  }

  console.log('\n========== STEP 3: FIX json → jsonString IN TESTS (tasks 5-20) ==========\n');

  for (let i = 4; i < taskIds.length; i++) {
    const taskId = taskIds[i];
    const update = TASK_UPDATES[taskId];

    // Skip task 20 AccountBuilder — it has newTests with jsonString already
    if (update && update.newTests) {
      console.log(`  Task ${i + 1}: ⏭️  skipped (has custom newTests)`);
      continue;
    }

    const t = await tasks.findOne({ _id: new ObjectId(taskId) });
    const newTests = t.tests.map(test => fixJsonVarInTest(test));

    // Verify no 'String json' remains
    for (const test of newTests) {
      if (/\bString json\b/.test(test)) {
        console.log(`❌ Task ${i + 1}: 'String json' still present after fix!`);
        await client.close();
        return;
      }
    }

    const result = await tasks.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: { tests: newTests } }
    );
    console.log(`  Task ${i + 1}: ${result.modifiedCount === 1 ? '✅' : '⚠️ '} fixed ${newTests.length} tests`);
  }

  console.log('\n========== STEP 4-6: UPDATE DESCRIPTIONS, REQUIREMENTS, DELTAS (tasks 5-20) ==========\n');

  for (const [taskId, update] of Object.entries(TASK_UPDATES)) {
    const t = await tasks.findOne({ _id: new ObjectId(taskId) });
    const idx = taskIds.indexOf(taskId) + 1;

    const setFields = {
      description: update.description,
      delta: [{ insert: update.description + '\n' }],
      requirements: update.requirements
    };

    // Task 20 has custom newTests
    if (update.newTests) {
      setFields.tests = update.newTests;
    }

    const result = await tasks.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: setFields }
    );
    console.log(`  Task ${idx}: ${result.modifiedCount === 1 ? '✅' : '⚠️ '} description + requirements + delta${update.newTests ? ' + tests' : ''}`);
  }

  console.log('\n========== VERIFICATION ==========\n');

  for (let i = 0; i < taskIds.length; i++) {
    const t = await tasks.findOne({ _id: new ObjectId(taskIds[i]) });
    const reqTestMatch = t.requirements.length === t.tests.length ? '✅' : '❌';
    const hasOrder = t.order === (i + 1) ? '✅' : '❌';
    const orgCodeSet = t.orgCode !== undefined ? '✅' : '❌';
    const deltaMatch = t.delta && t.delta[0] && t.delta[0].insert.trim() === t.description.trim() ? '✅' : '❌';
    const noJsonVar = !t.tests.join('\n').includes('String json ') && !t.tests.join('\n').includes('String json=') ? '✅' : '❌';
    const noEmDash = !t.description.includes('\u2014') ? '✅' : '❌';
    const noMethodSig = !t.description.includes('Method signature') ? '✅' : '❌';
    const noReqInDesc = !t.description.includes('Requirements:') ? '✅' : '❌';

    console.log(`  Task ${i + 1} | order:${hasOrder} | orgCode:${orgCodeSet}(${t.orgCode}) | req/test:${reqTestMatch} ${t.requirements.length}/${t.tests.length} | delta:${deltaMatch} | noJson:${noJsonVar} | noDash:${noEmDash} | noSig:${noMethodSig} | noReq:${noReqInDesc}`);
  }

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
