const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const TOPIC_ID = '6970d58b0a6f66b9d8042fce';

// Tasks 4-15 get description rewrites (remove "Method signature:" blocks)
const DESC_UPDATES = {
  // Task 4 - JsonBuilder.buildSimpleJson
  '69710f920a6f66b9d804304e': {
    description: "Create a class named JsonBuilder with a method named buildSimpleJson.\n\nThis method should create a Map with one key 'message' and value 'Hello World', then return the serialized JSON string."
  },
  // Task 5 - JsonBuilder.buildUserJson
  '69710f920a6f66b9d804304f': {
    description: "Create a class named JsonBuilder with a method named buildUserJson. It takes two parameters - name (String) and email (String).\n\nThe method should put both values into a Map and return the serialized JSON string."
  },
  // Task 6 - ProductJsonBuilder
  '69710f920a6f66b9d8043050': {
    description: "Create a class named ProductJsonBuilder with a method named buildProductJson. It takes productName (String) and price (Decimal).\n\nWhen mixing String and Decimal values, use Map<String, Object> instead of Map<String, String>.\n\nThe method should return the serialized JSON string."
  },
  // Task 7 - OrderJsonBuilder
  '69710f920a6f66b9d8043051': {
    description: "Create a class named OrderJsonBuilder with a method named buildOrderJson. It takes orderId (String), total (Decimal), and itemCount (Integer).\n\nThe method should put all three values into a Map<String, Object> and return the serialized JSON string."
  },
  // Task 8 - StatusJsonBuilder
  '69710f920a6f66b9d8043052': {
    description: "Create a class named StatusJsonBuilder with a method named buildStatusJson. It takes status (String) and isActive (Boolean).\n\nThe method should put both values into a Map<String, Object> and return the serialized JSON string."
  },
  // Task 9 - NestedJsonBuilder
  '69710f920a6f66b9d8043053': {
    description: "Create a class named NestedJsonBuilder with a method named buildAddressJson. It takes city (String) and country (String).\n\nThe method should create a nested JSON. First, create a Map for the address with 'city' and 'country'. Then put that map inside a main map with the key 'address'.\n\nExpected JSON structure: {\"address\": {\"city\": \"...\", \"country\": \"...\"}}"
  },
  // Task 10 - CustomerJsonBuilder
  '69710f920a6f66b9d8043054': {
    description: "Create a class named CustomerJsonBuilder with a method named buildCustomerJson. It takes name (String), email (String), city (String), and country (String).\n\nThe method should create a nested JSON with name and email at the top level, and city and country inside a nested 'address' object.\n\nExpected JSON structure: {\"name\": \"...\", \"email\": \"...\", \"address\": {\"city\": \"...\", \"country\": \"...\"}}"
  },
  // Task 11 - PaymentJsonBuilder (fix "currency" wording)
  '69710f920a6f66b9d8043055': {
    description: "Create a class named PaymentJsonBuilder with a method named buildPaymentJson. It takes paymentId (String), amount (Decimal), and currencyCode (String).\n\nThe method should create a nested JSON with paymentId at the top level and amount + currency inside a nested 'details' object.\n\nExpected JSON structure: {\"paymentId\": \"...\", \"details\": {\"amount\": ..., \"currency\": \"...\"}}"
  },
  // Task 12 - EventJsonBuilder
  '69710f920a6f66b9d8043056': {
    description: "Create a class named EventJsonBuilder with a method named buildEventJson. It takes eventName (String).\n\nThe method should create a JSON with two nested objects: 'event' containing the name, and 'metadata' containing a hardcoded timestamp of '2024-01-01'.\n\nExpected JSON structure: {\"event\": {\"name\": \"...\"}, \"metadata\": {\"timestamp\": \"2024-01-01\"}}"
  },
  // Task 13 - InvoiceJsonBuilder
  '69710f920a6f66b9d8043057': {
    description: "Create a class named InvoiceJsonBuilder with a method named buildInvoiceJson. It takes invoiceId (String), customerName (String), and amount (Decimal).\n\nThe method should create a JSON with nested 'customer' and 'billing' objects.\n\nExpected JSON structure: {\"invoiceId\": \"...\", \"customer\": {\"name\": \"...\"}, \"billing\": {\"amount\": ...}}"
  },
  // Task 14 - ShippingJsonBuilder
  '69710f920a6f66b9d8043058': {
    description: "Create a class named ShippingJsonBuilder with a method named buildShippingJson. It takes shipmentId (String), originCity (String), originZip (String), destCity (String), and destZip (String).\n\nThe method should create a JSON with two nested objects - 'origin' and 'destination' - each containing city and zip.\n\nExpected JSON structure: {\"shipmentId\": \"...\", \"origin\": {\"city\": \"...\", \"zip\": \"...\"}, \"destination\": {\"city\": \"...\", \"zip\": \"...\"}}"
  },
  // Task 15 - EmployeeJsonBuilder
  '69710f920a6f66b9d8043059': {
    description: "Create a class named EmployeeJsonBuilder with a method named buildEmployeeJson. It takes employeeId (String), empName (String), deptName (String), and managerName (String).\n\nThe method should create a JSON with an employee and their department, where department has a nested manager object.\n\nExpected JSON structure: {\"employeeId\": \"...\", \"name\": \"...\", \"department\": {\"deptName\": \"...\", \"manager\": {\"name\": \"...\"}}}"
  }
};

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');
  const topics = db.collection('topics');

  const topic = await topics.findOne({ _id: new ObjectId(TOPIC_ID) });
  const taskIds = topic.tasks;

  console.log('========== PRE-FLIGHT CHECKS ==========\n');
  console.log(`Topic: ${topic.topicName} | ${taskIds.length} tasks\n`);

  for (let i = 0; i < taskIds.length; i++) {
    const t = await tasks.findOne({ _id: new ObjectId(taskIds[i]) });
    if (!t) { console.log(`❌ Task ${i + 1} (${taskIds[i]}) not found!`); await client.close(); return; }

    const descUpdate = DESC_UPDATES[taskIds[i]];
    if (descUpdate) {
      if (descUpdate.description.includes('Method signature')) {
        console.log(`❌ Task ${i + 1}: still has Method signature in new description`);
        await client.close(); return;
      }
    }
    console.log(`✅ Task ${i + 1} (${taskIds[i]}): req/test ${t.requirements.length}/${t.tests.length}${descUpdate ? ' + desc rewrite' : ''}`);
  }

  console.log(`\n✅ All ${taskIds.length} tasks validated\n`);

  // STEP 1: Assign order 1-15
  console.log('========== STEP 1: ASSIGN ORDER 1-15 ==========\n');
  for (let i = 0; i < taskIds.length; i++) {
    const result = await tasks.updateOne(
      { _id: new ObjectId(taskIds[i]) },
      { $set: { order: i + 1 } }
    );
    console.log(`  Task ${i + 1}: ${result.modifiedCount === 1 ? '✅ order set' : '⚠️  no change'}`);
  }

  // STEP 2: Update descriptions + deltas (tasks 4-15)
  console.log('\n========== STEP 2: UPDATE DESCRIPTIONS + DELTAS ==========\n');
  for (const [taskId, update] of Object.entries(DESC_UPDATES)) {
    const idx = taskIds.indexOf(taskId) + 1;
    const result = await tasks.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: {
        description: update.description,
        delta: [{ insert: update.description + '\n' }]
      }}
    );
    console.log(`  Task ${idx}: ${result.modifiedCount === 1 ? '✅' : '⚠️ '} description + delta`);
  }

  // VERIFICATION
  console.log('\n========== VERIFICATION ==========\n');
  for (let i = 0; i < taskIds.length; i++) {
    const t = await tasks.findOne({ _id: new ObjectId(taskIds[i]) });
    const hasOrder = t.order === (i + 1) ? '✅' : '❌';
    const reqTestMatch = t.requirements.length === t.tests.length ? '✅' : '❌';
    const deltaMatch = t.delta && t.delta[0] && t.delta[0].insert.trim() === t.description.trim() ? '✅' : '❌';
    const noMethodSig = !t.description.includes('Method signature') ? '✅' : '❌';
    const noCurrencyParam = !t.description.includes('and currency (String)') ? '✅' : '❌';
    console.log(`  Task ${i + 1} | order:${hasOrder} | req/test:${reqTestMatch} ${t.requirements.length}/${t.tests.length} | delta:${deltaMatch} | noSig:${noMethodSig} | noCurrencyParam:${noCurrencyParam}`);
  }

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
