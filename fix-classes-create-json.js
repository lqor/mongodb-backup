const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const TOPIC_ID = '6970d58b0a6f66b9d8042fcf';

const DESC_UPDATES = {
  // Task 1 - UserRequest
  '697111fa0a6f66b9d8043060': {
    description: "Create a class named UserRequest in your org that can be serialized to JSON.\n\nAdd an inner class named Address with public variables: city (String), country (String).\n\nAdd public variables to UserRequest: userId (String), name (String), email (String), address (Address).\n\nAdd a toJson method that takes userId, name, email, city, and country as parameters. It should create a new UserRequest, populate all the fields (including the nested Address), and return the serialized JSON string."
  },
  // Task 2 - OrderRequest
  '697111fa0a6f66b9d8043061': {
    description: "Create a class named OrderRequest in your org that can be serialized to JSON.\n\nAdd an inner class named Item with public variables: productName (String), quantity (Integer).\n\nAdd public variables to OrderRequest: orderId (String), total (Decimal), item (Item).\n\nAdd a buildJson method that takes orderId, total, productName, and quantity as parameters. It should create a new OrderRequest, populate all the fields (including the nested Item), and return the serialized JSON string."
  },
  // Task 3 - PaymentRequest (fix currency -> currencyCode)
  '697111fa0a6f66b9d8043062': {
    description: "Create a class named PaymentRequest in your org with nested structure for payment data.\n\nAdd an inner class named CardInfo with: cardType (String), lastFour (String).\n\nAdd an inner class named Amount with: value (Decimal), currencyCode (String).\n\nAdd public variables to PaymentRequest: paymentId (String), card (CardInfo), amount (Amount).\n\nAdd a serialize method that takes paymentId, cardType, lastFour, value, and currencyCode as parameters. It should create a new PaymentRequest, populate all the fields, and return the serialized JSON string."
  },
  // Task 4 - BookingRequest
  '697111fa0a6f66b9d8043063': {
    description: "Create a class named BookingRequest in your org that handles hotel booking data.\n\nAdd an inner class named Guest with: guestName (String), email (String).\n\nAdd an inner class named Room with: roomType (String), nights (Integer).\n\nAdd public variables to BookingRequest: bookingId (String), guest (Guest), room (Room).\n\nAdd a toJsonString method that takes bookingId, guestName, email, roomType, and nights as parameters. It should create a new BookingRequest, populate all the fields, and return the serialized JSON string."
  },
  // Task 5 - ShipmentRequest
  '697111fa0a6f66b9d8043064': {
    description: "Create a class named ShipmentRequest in your org with deeply nested structure.\n\nAdd an inner class named Location with: city (String), zip (String).\n\nAdd an inner class named Warehouse with: warehouseId (String), location (Location).\n\nAdd public variables to ShipmentRequest: shipmentId (String), origin (Warehouse), destination (Warehouse).\n\nAdd a createJson method that takes shipmentId, originId, originCity, originZip, destId, destCity, and destZip as parameters. It should create a new ShipmentRequest, populate all the fields (including the deeply nested Location objects), and return the serialized JSON string."
  }
};

// Fixed PaymentRequest solution (currency -> currencyCode)
const PAYMENT_SOLUTION = `public class PaymentRequest {
    public String paymentId;
    public CardInfo card;
    public Amount amount;

    public class CardInfo {
        public String cardType;
        public String lastFour;
    }

    public class Amount {
        public Decimal value;
        public String currencyCode;
    }

    public String serialize(String paymentId, String cardType, String lastFour, Decimal value, String currencyCode) {
        PaymentRequest request = new PaymentRequest();
        request.paymentId = paymentId;
        request.card = new PaymentRequest.CardInfo();
        request.card.cardType = cardType;
        request.card.lastFour = lastFour;
        request.amount = new PaymentRequest.Amount();
        request.amount.value = value;
        request.amount.currencyCode = currencyCode;
        return JSON.serialize(request);
    }
}`;

// Fixed PaymentRequest test 2 (currency -> currencyCode)
const PAYMENT_TEST_2 = `PaymentRequest.CardInfo card = new PaymentRequest.CardInfo();
PaymentRequest.Amount amt = new PaymentRequest.Amount();
amt.currencyCode = 'test';
Assert.isNotNull(card, 'Inner classes must exist');`;

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

  // STEP 1: Assign order 1-5
  console.log('========== STEP 1: ASSIGN ORDER 1-5 ==========\n');
  for (let i = 0; i < taskIds.length; i++) {
    const result = await tasks.updateOne(
      { _id: new ObjectId(taskIds[i]) },
      { $set: { order: i + 1 } }
    );
    console.log(`  Task ${i + 1}: ${result.modifiedCount === 1 ? '✅ order set' : '⚠️  no change'}`);
  }

  // STEP 2: Update descriptions + deltas
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

  // STEP 3: Fix PaymentRequest solution + test (currency -> currencyCode)
  console.log('\n========== STEP 3: FIX PAYMENTREQUEST CURRENCY ==========\n');
  const paymentId = '697111fa0a6f66b9d8043062';
  const paymentTask = await tasks.findOne({ _id: new ObjectId(paymentId) });
  const newTests = [...paymentTask.tests];
  newTests[1] = PAYMENT_TEST_2;
  const result = await tasks.updateOne(
    { _id: new ObjectId(paymentId) },
    { $set: {
      solution: PAYMENT_SOLUTION,
      tests: newTests
    }}
  );
  console.log(`  PaymentRequest solution: ${result.modifiedCount === 1 ? '✅' : '⚠️ '} currency -> currencyCode`);
  console.log(`  PaymentRequest test 2: ✅ updated`);

  // VERIFICATION
  console.log('\n========== VERIFICATION ==========\n');
  for (let i = 0; i < taskIds.length; i++) {
    const t = await tasks.findOne({ _id: new ObjectId(taskIds[i]) });
    const hasOrder = t.order === (i + 1) ? '✅' : '❌';
    const reqTestMatch = t.requirements.length === t.tests.length ? '✅' : '❌';
    const deltaMatch = t.delta && t.delta[0] && t.delta[0].insert.trim() === t.description.trim() ? '✅' : '❌';
    const noMethodSig = !t.description.includes('Method signature') ? '✅' : '❌';
    const noNumberedList = !t.description.match(/^\d+\./m) ? '✅' : '❌';
    const noCurrency = !t.solution.includes('public String currency;') ? '✅' : '❌';
    console.log(`  Task ${i + 1} | order:${hasOrder} | req/test:${reqTestMatch} ${t.requirements.length}/${t.tests.length} | delta:${deltaMatch} | noSig:${noMethodSig} | noList:${noNumberedList} | noCurrency:${noCurrency}`);
  }

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
