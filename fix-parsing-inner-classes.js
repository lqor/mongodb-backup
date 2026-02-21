const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const TOPIC_ID = '6970d58b0a6f66b9d8042fcd';

function fixJsonVarInTest(test) {
  return test
    .replace(/\bString json\b/g, 'String jsonString')
    .replace(/\(json\)/g, '(jsonString)');
}

// Tasks 4-14 get new descriptions (tasks 1-3 are fine as-is)
const DESC_UPDATES = {
  // Task 4 - CustomerParser
  '69710dcf0a6f66b9d804303f': {
    description: "Create a CustomerParser class in your org with an inner class named Customer and a parseCustomer method.\n\nThe Customer inner class should have public variables: id (String), name (String), email (String).\n\nThe parseCustomer method takes a JSON string and returns a Customer object using JSON.deserialize.\n\nExample JSON: {\"id\": \"CUS-001\", \"name\": \"John Doe\", \"email\": \"john@example.com\"}"
  },
  // Task 5 - PaymentParser (already fixed currency -> currencyCode)
  '69710dcf0a6f66b9d8043040': {
    description: "Create a PaymentParser class in your org with an inner class named Payment and a getAmount method.\n\nThe Payment inner class should have public variables: paymentId (String), amount (Decimal), currencyCode (String).\n\nThe getAmount method takes a JSON string, parses it into a Payment object, and returns just the amount value.\n\nExample JSON: {\"paymentId\": \"PAY-100\", \"amount\": 250.00, \"currencyCode\": \"USD\"}"
  },
  // Task 6 - InvoiceParser
  '69710dcf0a6f66b9d8043041': {
    description: "Create an InvoiceParser class in your org with an inner class named Invoice and an isPaid method.\n\nThe Invoice inner class should have public variables: invoiceId (String), total (Decimal), paid (Boolean).\n\nThe isPaid method takes a JSON string, parses it into an Invoice object, and returns the paid value.\n\nExample JSON: {\"invoiceId\": \"INV-001\", \"total\": 500.00, \"paid\": true}"
  },
  // Task 7 - UserParser (nested)
  '69710dcf0a6f66b9d8043042': {
    description: "Create a UserParser class in your org that handles nested JSON. The JSON has an address object inside.\n\nCreate two inner classes:\n- Address with: city (String), country (String)\n- User with: userId (String), name (String), address (Address)\n\nThe getCity method parses the JSON and returns the city from inside the address.\n\nExample JSON: {\"userId\": \"USR-001\", \"name\": \"Jane Doe\", \"address\": {\"city\": \"New York\", \"country\": \"USA\"}}"
  },
  // Task 8 - CompanyParser (nested)
  '69710dcf0a6f66b9d8043043': {
    description: "Create a CompanyParser class in your org that handles nested JSON.\n\nCreate two inner classes:\n- Location with: city (String), state (String)\n- Company with: companyId (String), companyName (String), headquarters (Location)\n\nThe parseCompany method returns the full Company object.\n\nExample JSON: {\"companyId\": \"COMP-001\", \"companyName\": \"Acme Corp\", \"headquarters\": {\"city\": \"Chicago\", \"state\": \"IL\"}}"
  },
  // Task 9 - EmployeeParser (deeply nested)
  '69710dcf0a6f66b9d8043044': {
    description: "Create an EmployeeParser class in your org that handles nested JSON with two levels.\n\nCreate three inner classes:\n- Manager with: managerId (String), managerName (String)\n- Department with: deptName (String), manager (Manager)\n- Employee with: employeeId (String), name (String), department (Department)\n\nThe getManagerName method parses the JSON and returns the manager's name.\n\nExample JSON: {\"employeeId\": \"EMP-001\", \"name\": \"Alice Brown\", \"department\": {\"deptName\": \"Engineering\", \"manager\": {\"managerId\": \"MGR-001\", \"managerName\": \"Bob Wilson\"}}}"
  },
  // Task 10 - BookingParser (two nested objects, two methods)
  '69710dcf0a6f66b9d8043045': {
    description: "Create a BookingParser class in your org with two methods that extract different values from the same JSON.\n\nCreate three inner classes:\n- Guest with: guestName (String), email (String)\n- Room with: roomNumber (String), floor (Integer)\n- Booking with: bookingId (String), guest (Guest), room (Room)\n\nThe getGuestEmail method returns the guest's email. The getRoomNumber method returns the room number.\n\nExample JSON: {\"bookingId\": \"BK-001\", \"guest\": {\"guestName\": \"Tom Hardy\", \"email\": \"tom@test.com\"}, \"room\": {\"roomNumber\": \"101\", \"floor\": 1}}"
  },
  // Task 11 - AccountService (parse to sObject)
  '69710dcf0a6f66b9d8043046': {
    description: "Create an AccountService class in your org that parses JSON and creates a Salesforce Account record.\n\nCreate an inner class named AccountData with: accountId (String), accountName (String), website (String), revenue (Decimal).\n\nThe createAccount method parses the JSON into AccountData and returns an Account sObject with Name and Website populated. Do not insert the Account.\n\nExample JSON: {\"accountId\": \"ACC-001\", \"accountName\": \"Tech Solutions\", \"website\": \"www.techsolutions.com\", \"revenue\": 5000000}"
  },
  // Task 12 - ContactService (nested, parse to sObject)
  '69710dcf0a6f66b9d8043047': {
    description: "Create a ContactService class in your org that parses nested JSON and creates a Contact record.\n\nCreate two inner classes:\n- Address with: city (String), state (String)\n- ContactInfo with: contactId (String), fullName (String), email (String), address (Address)\n\nThe createContact method parses the JSON and returns a Contact sObject with LastName (use fullName), Email, and MailingCity populated. Do not insert the Contact.\n\nExample JSON: {\"contactId\": \"CON-001\", \"fullName\": \"Sarah Connor\", \"email\": \"sarah@test.com\", \"address\": {\"city\": \"Austin\", \"state\": \"TX\"}}"
  },
  // Task 13 - ShipmentParser (deeply nested)
  '69710dcf0a6f66b9d8043048': {
    description: "Create a ShipmentParser class in your org that handles deeply nested JSON.\n\nCreate three inner classes:\n- Location with: city (String), zip (String)\n- Warehouse with: warehouse (String), location (Location)\n- Shipment with: shipmentId (String), origin (Warehouse), destination (Warehouse)\n\nThe getDestinationCity method returns the destination city.\n\nExample JSON: {\"shipmentId\": \"SHP-001\", \"origin\": {\"warehouse\": \"WH-A\", \"location\": {\"city\": \"Seattle\", \"zip\": \"98101\"}}, \"destination\": {\"warehouse\": \"WH-B\", \"location\": {\"city\": \"Portland\", \"zip\": \"97201\"}}}"
  },
  // Task 14 - TicketParser (multiple nested objects, two methods)
  '69710dcf0a6f66b9d8043049': {
    description: "Create a TicketParser class in your org that handles JSON with multiple nested objects.\n\nCreate three inner classes:\n- Customer with: customerId (String), name (String)\n- Agent with: agentId (String), name (String)\n- Ticket with: ticketId (String), subject (String), customer (Customer), assignee (Agent)\n\nThe getCustomerName method returns the customer name. The getAssigneeName method returns the assignee name.\n\nExample JSON: {\"ticketId\": \"TKT-001\", \"subject\": \"Login Issue\", \"customer\": {\"customerId\": \"CUS-100\", \"name\": \"Mike Ross\"}, \"assignee\": {\"agentId\": \"AGT-50\", \"name\": \"Harvey Specter\"}}"
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
      // Verify no reserved words in new description
      if (descUpdate.description.includes('Method signature')) {
        console.log(`❌ Task ${i + 1}: still has Method signature in new description`);
        await client.close(); return;
      }
    }
    console.log(`✅ Task ${i + 1} (${taskIds[i]}): req/test ${t.requirements.length}/${t.tests.length}${descUpdate ? ' + desc rewrite' : ''}`);
  }

  console.log(`\n✅ All ${taskIds.length} tasks validated\n`);

  // STEP 1: Assign order 1-14
  console.log('========== STEP 1: ASSIGN ORDER 1-14 ==========\n');
  for (let i = 0; i < taskIds.length; i++) {
    const result = await tasks.updateOne(
      { _id: new ObjectId(taskIds[i]) },
      { $set: { order: i + 1 } }
    );
    console.log(`  Task ${i + 1}: ${result.modifiedCount === 1 ? '✅ order set' : '⚠️  no change'}`);
  }

  // STEP 2: Fix String json -> String jsonString in tests (tasks 4-14)
  console.log('\n========== STEP 2: FIX json -> jsonString IN TESTS ==========\n');
  for (let i = 3; i < taskIds.length; i++) {
    const t = await tasks.findOne({ _id: new ObjectId(taskIds[i]) });
    const testsStr = t.tests.join('\n');
    if (!testsStr.includes('String json')) {
      console.log(`  Task ${i + 1}: ⏭️  no String json found`);
      continue;
    }
    const newTests = t.tests.map(test => fixJsonVarInTest(test));
    // Verify
    for (const test of newTests) {
      if (/\bString json\b/.test(test)) {
        console.log(`❌ Task ${i + 1}: String json still present!`);
        await client.close(); return;
      }
    }
    const result = await tasks.updateOne(
      { _id: new ObjectId(taskIds[i]) },
      { $set: { tests: newTests } }
    );
    console.log(`  Task ${i + 1}: ${result.modifiedCount === 1 ? '✅' : '⚠️ '} fixed ${newTests.length} tests`);
  }

  // STEP 3: Update descriptions + deltas (tasks 4-14)
  console.log('\n========== STEP 3: UPDATE DESCRIPTIONS + DELTAS ==========\n');
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
    const noJsonVar = !t.tests.join('\n').includes('String json ') ? '✅' : '❌';
    const noMethodSig = !t.description.includes('Method signature') ? '✅' : '❌';
    const noCurrency = !t.solution.includes('public String currency;') ? '✅' : '❌';
    console.log(`  Task ${i + 1} | order:${hasOrder} | req/test:${reqTestMatch} ${t.requirements.length}/${t.tests.length} | delta:${deltaMatch} | noJson:${noJsonVar} | noSig:${noMethodSig} | noCurrency:${noCurrency}`);
  }

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
