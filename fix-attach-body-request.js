const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const TOPIC_ID = '6970d58b0a6f66b9d8042fd0';

// Description rewrites for tasks 2-9
const DESC_UPDATES = {
  // Task 2 - RequestBuilder
  '6971142b0a6f66b9d8043068': {
    description: "Create a class named RequestBuilder with a method named buildPostRequest. It takes a JSON string (jsonBody) and returns an HttpRequest configured for a POST request with the body attached.\n\nThe request should have:\n- Endpoint: https://735ef563-176d-431c-85ce-2cc07056ef03.mock.pstmn.io/payments/link\n- Method: POST\n- Header: Content-Type = application/json\n- Body: the provided JSON string"
  },
  // Task 3 - PaymentRequestBuilder (rename currency param to currencyCode in description)
  '6971142b0a6f66b9d8043069': {
    description: "Create a class named PaymentRequestBuilder with a method named buildPaymentRequest. It takes paymentId (String), amount (Decimal), and currencyCode (String).\n\nThe method should create a nested JSON body with a 'payment' object containing these fields, then attach it to a POST HttpRequest and return it.\n\nExpected body structure: {\"payment\": {\"paymentId\": \"...\", \"amount\": ..., \"currency\": \"...\"}}"
  },
  // Task 4 - WebhookRequestBuilder
  '6971142b0a6f66b9d804306a': {
    description: "Create a class named WebhookRequestBuilder with a method named buildWebhookRequest. It takes eventType (String) and payload (String).\n\nThe method should create a JSON body with eventType, payload, and a hardcoded timestamp of '2024-01-01'. Then attach it to a POST HttpRequest and return it.\n\nExpected body structure: {\"eventType\": \"...\", \"payload\": \"...\", \"timestamp\": \"2024-01-01\"}"
  },
  // Task 5 - StripePaymentService (fix currency -> currencyCode)
  '6971142b0a6f66b9d804306b': {
    description: "Create a class named StripePaymentService in your org that handles a complete payment flow.\n\nAdd these inner classes:\n- CustomerInfo with: name (String), email (String)\n- PaymentDetails with: amount (Decimal), currencyCode (String)\n- PaymentRequest with: customer (CustomerInfo), payment (PaymentDetails)\n\nAdd a createPaymentRequest method that takes name, email, amount, and currencyCode. It should build the nested structure, serialize it as the body of a POST HttpRequest, and return the request.\n\nAdd a parsePaymentResponse method that takes a JSON response string and returns the paymentId value.\n\nExample response: {\"paymentId\": \"PAY-001\", \"status\": \"success\", \"created\": 1234567890}"
  },
  // Task 6 - OrderIntegrationService
  '6971142b0a6f66b9d804306c': {
    description: "Create a class named OrderIntegrationService in your org that handles order creation with a third-party system.\n\nAdd these inner classes:\n- ShippingAddress with: street (String), city (String), country (String)\n- OrderItem with: productId (String), quantity (Integer), price (Decimal)\n- OrderRequest with: orderId (String), item (OrderItem), shipping (ShippingAddress)\n- OrderResponse with: confirmationId (String), estimatedDelivery (String), totalPrice (Decimal)\n\nAdd a buildOrderRequest method that takes orderId, productId, quantity, price, street, city, and country. It should build the nested structure and return a POST HttpRequest.\n\nAdd an extractConfirmation method that parses a JSON response and returns the confirmationId."
  },
  // Task 7 - CustomerSyncService
  '6971142b0a6f66b9d804306d': {
    description: "Create a class named CustomerSyncService in your org that syncs customer data with an external CRM.\n\nAdd these inner classes:\n- ContactInfo with: firstName (String), lastName (String), email (String)\n- CompanyInfo with: companyName (String), industry (String)\n- SyncRequest with: externalId (String), contact (ContactInfo), company (CompanyInfo)\n- SyncResponse with: syncId (String), status (String), syncedAt (String)\n\nAdd a createSyncRequest method that takes externalId, firstName, lastName, email, companyName, and industry. It should build the nested structure and return a POST HttpRequest.\n\nAdd an isSyncSuccessful method that parses a JSON response and returns true if status equals 'completed'."
  },
  // Task 8 - InvoiceApiService
  '6971142b0a6f66b9d804306e': {
    description: "Create a class named InvoiceApiService in your org that handles invoice creation and processes responses.\n\nAdd these inner classes for the request:\n- LineItem with: description (String), amount (Decimal)\n- BillingInfo with: customerName (String), email (String)\n- InvoiceRequest with: invoiceNumber (String), billing (BillingInfo), lineItem (LineItem)\n\nAdd these inner classes for the response:\n- PaymentLink with: url (String), expiresAt (String)\n- InvoiceResponse with: invoiceId (String), total (Decimal), paymentLink (PaymentLink)\n\nAdd a createInvoiceRequest method that takes invoiceNumber, customerName, email, description, and amount. It should build the nested structure and return a POST HttpRequest.\n\nAdd a getPaymentUrl method that parses a JSON response and returns the nested payment link URL."
  },
  // Task 9 - ShippingIntegrationService (fix Package -> PackageInfo)
  '6971142b0a6f66b9d804306f': {
    description: "Create a class named ShippingIntegrationService in your org that manages shipment creation and tracking.\n\nAdd these inner classes for the request:\n- Address with: street (String), city (String), zip (String), country (String)\n- PackageInfo with: weight (Decimal), dimensions (String)\n- ShipmentRequest with: shipmentId (String), origin (Address), destination (Address), shipmentPackage (PackageInfo)\n\nAdd these inner classes for the response:\n- TrackingInfo with: trackingNumber (String), carrier (String)\n- ShipmentResponse with: shipmentId (String), status (String), tracking (TrackingInfo), estimatedCost (Decimal)\n\nAdd a createShipmentRequest method that takes shipmentId, originStreet, originCity, originZip, originCountry, destStreet, destCity, destZip, destCountry, weight, and dimensions. It should build the deeply nested structure and return a POST HttpRequest.\n\nAdd a getTrackingNumber method that parses a JSON response and returns the nested tracking number."
  }
};

// Task 3 - fix currency param name in solution
const TASK3_SOLUTION = `public class PaymentRequestBuilder {
    public HttpRequest buildPaymentRequest(String paymentId, Decimal amount, String currencyCode) {
        Map<String, Object> paymentMap = new Map<String, Object>();
        paymentMap.put('paymentId', paymentId);
        paymentMap.put('amount', amount);
        paymentMap.put('currency', currencyCode);
        Map<String, Object> data = new Map<String, Object>();
        data.put('payment', paymentMap);
        String jsonBody = JSON.serialize(data);
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://735ef563-176d-431c-85ce-2cc07056ef03.mock.pstmn.io/payments/link');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setBody(jsonBody);
        return request;
    }
}`;

// Task 3 - fix test calls to use currencyCode param name
const TASK3_TESTS = [
  "PaymentRequestBuilder builder = new PaymentRequestBuilder();\nHttpRequest request = builder.buildPaymentRequest('PAY-100', 250.00, 'USD');\nAssert.areEqual('POST', request.getMethod(), 'Method should be POST');",
  "PaymentRequestBuilder builder = new PaymentRequestBuilder();\nHttpRequest request = builder.buildPaymentRequest('PAY-100', 250.00, 'USD');\nAssert.isTrue(request.getBody().contains('payment'), 'Body should contain payment object');",
  "PaymentRequestBuilder builder = new PaymentRequestBuilder();\nHttpRequest request = builder.buildPaymentRequest('PAY-100', 250.00, 'USD');\nAssert.isTrue(request.getBody().contains('PAY-100') && request.getBody().contains('USD'), 'Body should contain paymentId and currency');"
];

// Task 5 - fix currency -> currencyCode in solution + tests
const TASK5_SOLUTION = `public class StripePaymentService {
    public class CustomerInfo {
        public String name;
        public String email;
    }

    public class PaymentDetails {
        public Decimal amount;
        public String currencyCode;
    }

    public class PaymentRequest {
        public CustomerInfo customer;
        public PaymentDetails payment;
    }

    public class PaymentResponse {
        public String paymentId;
        public String status;
        public Integer created;
    }

    public HttpRequest createPaymentRequest(String name, String email, Decimal amount, String currencyCode) {
        PaymentRequest req = new PaymentRequest();
        req.customer = new CustomerInfo();
        req.customer.name = name;
        req.customer.email = email;
        req.payment = new PaymentDetails();
        req.payment.amount = amount;
        req.payment.currencyCode = currencyCode;
        String jsonBody = JSON.serialize(req);
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://735ef563-176d-431c-85ce-2cc07056ef03.mock.pstmn.io/payments/link');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setBody(jsonBody);
        return request;
    }

    public String parsePaymentResponse(String jsonResponse) {
        PaymentResponse resp = (PaymentResponse) JSON.deserialize(jsonResponse, PaymentResponse.class);
        return resp.paymentId;
    }
}`;

// Task 5 tests - fix currency -> currencyCode
const TASK5_TESTS = [
  "StripePaymentService service = new StripePaymentService();\nAssert.isNotNull(service, 'StripePaymentService class must exist');",
  "StripePaymentService.CustomerInfo cust = new StripePaymentService.CustomerInfo();\nStripePaymentService.PaymentDetails pay = new StripePaymentService.PaymentDetails();\nStripePaymentService.PaymentRequest req = new StripePaymentService.PaymentRequest();\nAssert.isNotNull(cust, 'Inner classes must exist');",
  "StripePaymentService service = new StripePaymentService();\nHttpRequest request = service.createPaymentRequest('John Doe', 'john@test.com', 100.00, 'USD');\nAssert.areEqual('POST', request.getMethod(), 'Method should be POST');",
  "StripePaymentService service = new StripePaymentService();\nHttpRequest request = service.createPaymentRequest('John Doe', 'john@test.com', 100.00, 'USD');\nAssert.isTrue(request.getBody().contains('customer') && request.getBody().contains('John Doe'), 'Body should contain nested customer');",
  "StripePaymentService service = new StripePaymentService();\nHttpRequest request = service.createPaymentRequest('John Doe', 'john@test.com', 100.00, 'USD');\nAssert.isTrue(request.getBody().contains('payment') && request.getBody().contains('USD'), 'Body should contain nested payment');",
  "StripePaymentService service = new StripePaymentService();\nString json = '{\"paymentId\": \"PAY-001\", \"status\": \"success\", \"created\": 1234567890}';\nString result = service.parsePaymentResponse(json);\nAssert.areEqual('PAY-001', result, 'Should return paymentId');"
];

// Task 9 - fix Package -> PackageInfo in solution + tests
const TASK9_SOLUTION = `public class ShippingIntegrationService {
    public class Address {
        public String street;
        public String city;
        public String zip;
        public String country;
    }

    public class PackageInfo {
        public Decimal weight;
        public String dimensions;
    }

    public class ShipmentRequest {
        public String shipmentId;
        public Address origin;
        public Address destination;
        public PackageInfo shipmentPackage;
    }

    public class TrackingInfo {
        public String trackingNumber;
        public String carrier;
    }

    public class ShipmentResponse {
        public String shipmentId;
        public String status;
        public TrackingInfo tracking;
        public Decimal estimatedCost;
    }

    public HttpRequest createShipmentRequest(String shipmentId, String originStreet, String originCity, String originZip, String originCountry, String destStreet, String destCity, String destZip, String destCountry, Decimal weight, String dimensions) {
        ShipmentRequest req = new ShipmentRequest();
        req.shipmentId = shipmentId;
        req.origin = new Address();
        req.origin.street = originStreet;
        req.origin.city = originCity;
        req.origin.zip = originZip;
        req.origin.country = originCountry;
        req.destination = new Address();
        req.destination.street = destStreet;
        req.destination.city = destCity;
        req.destination.zip = destZip;
        req.destination.country = destCountry;
        req.shipmentPackage = new PackageInfo();
        req.shipmentPackage.weight = weight;
        req.shipmentPackage.dimensions = dimensions;
        String jsonBody = JSON.serialize(req);
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://735ef563-176d-431c-85ce-2cc07056ef03.mock.pstmn.io/payments/link');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setBody(jsonBody);
        return request;
    }

    public String getTrackingNumber(String jsonResponse) {
        ShipmentResponse resp = (ShipmentResponse) JSON.deserialize(jsonResponse, ShipmentResponse.class);
        return resp.tracking.trackingNumber;
    }
}`;

// Task 9 tests - fix Package -> PackageInfo
const TASK9_TESTS = [
  "ShippingIntegrationService service = new ShippingIntegrationService();\nAssert.isNotNull(service, 'ShippingIntegrationService class must exist');",
  "ShippingIntegrationService.Address addr = new ShippingIntegrationService.Address();\nShippingIntegrationService.PackageInfo pkg = new ShippingIntegrationService.PackageInfo();\nShippingIntegrationService.TrackingInfo track = new ShippingIntegrationService.TrackingInfo();\nAssert.isNotNull(addr, 'Inner classes must exist');",
  "ShippingIntegrationService service = new ShippingIntegrationService();\nHttpRequest request = service.createShipmentRequest('SHP-001', '100 First Ave', 'Seattle', '98101', 'USA', '200 Second St', 'Portland', '97201', 'USA', 5.5, '10x10x10');\nAssert.isTrue(request.getBody().contains('origin') && request.getBody().contains('Seattle'), 'Body should contain nested origin');",
  "ShippingIntegrationService service = new ShippingIntegrationService();\nHttpRequest request = service.createShipmentRequest('SHP-001', '100 First Ave', 'Seattle', '98101', 'USA', '200 Second St', 'Portland', '97201', 'USA', 5.5, '10x10x10');\nAssert.isTrue(request.getBody().contains('destination') && request.getBody().contains('Portland'), 'Body should contain nested destination');",
  "ShippingIntegrationService service = new ShippingIntegrationService();\nHttpRequest request = service.createShipmentRequest('SHP-001', '100 First Ave', 'Seattle', '98101', 'USA', '200 Second St', 'Portland', '97201', 'USA', 5.5, '10x10x10');\nAssert.isTrue(request.getBody().contains('shipmentPackage') && request.getBody().contains('5.5'), 'Body should contain nested package');",
  "ShippingIntegrationService service = new ShippingIntegrationService();\nString json = '{\"shipmentId\": \"SHP-001\", \"status\": \"shipped\", \"tracking\": {\"trackingNumber\": \"1Z999AA10123456784\", \"carrier\": \"UPS\"}, \"estimatedCost\": 25.99}';\nString result = service.getTrackingNumber(json);\nAssert.areEqual('1Z999AA10123456784', result, 'Should return nested tracking number');"
];

// Task 9 requirements - fix Package -> PackageInfo
const TASK9_REQUIREMENTS = [
  "The ShippingIntegrationService class exists in the org",
  "The inner classes Address, PackageInfo, ShipmentRequest, TrackingInfo, ShipmentResponse exist",
  "The createShipmentRequest body contains nested 'origin' with 'Seattle'",
  "The createShipmentRequest body contains nested 'destination' with 'Portland'",
  "The createShipmentRequest body contains nested 'shipmentPackage' with weight",
  "The getTrackingNumber method returns the nested tracking number"
];

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
    if (descUpdate && descUpdate.description.includes('Method signature')) {
      console.log(`❌ Task ${i + 1}: still has Method signature`); await client.close(); return;
    }
    console.log(`✅ Task ${i + 1} (${taskIds[i]}): req/test ${t.requirements.length}/${t.tests.length}${descUpdate ? ' + desc rewrite' : ''}`);
  }
  console.log(`\n✅ All ${taskIds.length} tasks validated\n`);

  // STEP 1: Assign order 1-9
  console.log('========== STEP 1: ASSIGN ORDER 1-9 ==========\n');
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

  // STEP 3: Fix Task 3 - currency param
  console.log('\n========== STEP 3: FIX TASK 3 (currency param) ==========\n');
  const r3 = await tasks.updateOne(
    { _id: new ObjectId('6971142b0a6f66b9d8043069') },
    { $set: { solution: TASK3_SOLUTION, tests: TASK3_TESTS } }
  );
  console.log(`  Task 3 solution+tests: ${r3.modifiedCount === 1 ? '✅' : '⚠️ '}`);

  // STEP 4: Fix Task 5 - currency -> currencyCode
  console.log('\n========== STEP 4: FIX TASK 5 (StripePaymentService currency) ==========\n');
  const r5 = await tasks.updateOne(
    { _id: new ObjectId('6971142b0a6f66b9d804306b') },
    { $set: { solution: TASK5_SOLUTION, tests: TASK5_TESTS } }
  );
  console.log(`  Task 5 solution+tests: ${r5.modifiedCount === 1 ? '✅' : '⚠️ '}`);

  // STEP 5: Fix Task 9 - Package -> PackageInfo
  console.log('\n========== STEP 5: FIX TASK 9 (Package -> PackageInfo) ==========\n');
  const r9 = await tasks.updateOne(
    { _id: new ObjectId('6971142b0a6f66b9d804306f') },
    { $set: { solution: TASK9_SOLUTION, tests: TASK9_TESTS, requirements: TASK9_REQUIREMENTS } }
  );
  console.log(`  Task 9 solution+tests+reqs: ${r9.modifiedCount === 1 ? '✅' : '⚠️ '}`);

  // VERIFICATION
  console.log('\n========== VERIFICATION ==========\n');
  for (let i = 0; i < taskIds.length; i++) {
    const t = await tasks.findOne({ _id: new ObjectId(taskIds[i]) });
    const hasOrder = t.order === (i + 1) ? '✅' : '❌';
    const reqTestMatch = t.requirements.length === t.tests.length ? '✅' : '❌';
    const deltaMatch = t.delta && t.delta[0] && t.delta[0].insert.trim() === t.description.trim() ? '✅' : '❌';
    const noMethodSig = !t.description.includes('Method signature') ? '✅' : '❌';
    const noCurrencyField = !t.solution.includes('public String currency;') ? '✅' : '❌';
    const noPackageClass = !t.solution.includes('class Package ') ? '✅' : '❌';
    console.log(`  Task ${i + 1} | order:${hasOrder} | req/test:${reqTestMatch} ${t.requirements.length}/${t.tests.length} | delta:${deltaMatch} | noSig:${noMethodSig} | noCurrency:${noCurrencyField} | noPackage:${noPackageClass}`);
  }

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
