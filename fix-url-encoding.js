const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const TOPIC_ID = '6970d58b0a6f66b9d8042fd1';

// Task 4 - fix test 5 (should actually call createInvoice with real customer),
//          fix test 7 (use real customer ID from StripeCustomerService)
const TASK4_ID = '69760b6bb58cfc4095418ee9';
const TASK4_TESTS = [
  // Test 1 - endpoint check
  `StripeInvoiceService service = new StripeInvoiceService();
HttpRequest req = service.buildCreateInvoiceRequest('cus_test123', 'Test Invoice');
Assert.isTrue(req.getEndpoint().contains('api.stripe.com/v1/invoices'), 'Endpoint must contain api.stripe.com/v1/invoices');`,
  // Test 2 - method check
  `StripeInvoiceService service = new StripeInvoiceService();
HttpRequest req = service.buildCreateInvoiceRequest('cus_test123', 'Test Invoice');
Assert.areEqual('POST', req.getMethod(), 'Method must be POST');`,
  // Test 3 - auth check
  `StripeInvoiceService service = new StripeInvoiceService();
HttpRequest req = service.buildCreateInvoiceRequest('cus_test123', 'Test Invoice');
Assert.isTrue(req.getHeader('Authorization').startsWith('Bearer'), 'Authorization header must start with Bearer');`,
  // Test 4 - body contains customer
  `StripeInvoiceService service = new StripeInvoiceService();
HttpRequest req = service.buildCreateInvoiceRequest('cus_test123', 'Test Invoice');
Assert.isTrue(req.getBody().contains('customer'), 'Body must contain customer parameter');`,
  // Test 5 - createInvoice returns response (uses real customer from StripeCustomerService)
  `StripeCustomerService custService = new StripeCustomerService();
Contact testContact = new Contact(FirstName = 'Invoice', LastName = 'Test', Email = 'invoice_test@test.com');
String custResponse = custService.createCustomer(testContact);
Map<String, Object> custData = (Map<String, Object>) JSON.deserializeUntyped(custResponse);
String customerId = (String) custData.get('id');
StripeInvoiceService service = new StripeInvoiceService();
String response = service.createInvoice(customerId, 'Test Invoice');
Assert.isTrue(response.contains('"object"'), 'Response should contain object field');`,
  // Test 6 - getInvoicesByCustomer returns list (uses real customer from StripeCustomerService)
  `StripeCustomerService custService = new StripeCustomerService();
Contact testContact = new Contact(FirstName = 'Invoice', LastName = 'Test', Email = 'invoice_list@test.com');
String custResponse = custService.createCustomer(testContact);
Map<String, Object> custData = (Map<String, Object>) JSON.deserializeUntyped(custResponse);
String customerId = (String) custData.get('id');
StripeInvoiceService service = new StripeInvoiceService();
List<Map<String, Object>> invoices = service.getInvoicesByCustomer(customerId);
Assert.isNotNull(invoices, 'Should return a list (can be empty)');`,
  // Test 7 - body contains description
  `StripeInvoiceService service = new StripeInvoiceService();
HttpRequest req = service.buildCreateInvoiceRequest('cus_test123', 'Test Invoice');
Assert.isTrue(req.getBody().contains('description'), 'Body must contain description parameter');`
];

const TASK4_REQUIREMENTS = [
  "The buildCreateInvoiceRequest method returns an HttpRequest with endpoint containing api.stripe.com/v1/invoices",
  "The buildCreateInvoiceRequest method returns an HttpRequest with method set to POST",
  "The buildCreateInvoiceRequest method returns an HttpRequest with Authorization header starting with Bearer",
  "The buildCreateInvoiceRequest method returns an HttpRequest with body containing customer",
  "The createInvoice method returns a response containing object field (requires working StripeCustomerService)",
  "The getInvoicesByCustomer method returns a list (requires working StripeCustomerService)",
  "The buildCreateInvoiceRequest method returns an HttpRequest with body containing description"
];

// Task 5 - fix currency -> currencyCode in solution + tests,
//          fix test 7 (use real product ID from StripeProductService)
const TASK5_ID = '69760b6bb58cfc4095418eea';

const TASK5_SOLUTION = `public class StripePriceService {
    private String apiKey = 'sk_test_your_key_here';

    public HttpRequest buildCreatePriceRequest(String productId, Integer unitAmount, String currencyCode) {
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/prices');
        request.setMethod('POST');
        request.setHeader('Authorization', 'Bearer ' + apiKey);
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        String body = 'product=' + EncodingUtil.urlEncode(productId, 'UTF-8') + '&unit_amount=' + unitAmount + '&currency=' + EncodingUtil.urlEncode(currencyCode, 'UTF-8');
        request.setBody(body);
        return request;
    }

    public String createPrice(String productId, Integer unitAmount, String currencyCode) {
        HttpRequest request = buildCreatePriceRequest(productId, unitAmount, currencyCode);
        Http http = new Http();
        HttpResponse response = http.send(request);
        return response.getBody();
    }

    public List<Map<String, Object>> getPricesByProduct(String productId) {
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/prices?product=' + EncodingUtil.urlEncode(productId, 'UTF-8'));
        request.setMethod('GET');
        request.setHeader('Authorization', 'Bearer ' + apiKey);
        Http http = new Http();
        HttpResponse response = http.send(request);
        List<Map<String, Object>> prices = new List<Map<String, Object>>();
        Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
        List<Object> data = (List<Object>) result.get('data');
        for (Object item : data) {
            prices.add((Map<String, Object>) item);
        }
        return prices;
    }
}`;

const TASK5_TESTS = [
  // Test 1 - endpoint
  `StripePriceService service = new StripePriceService();
HttpRequest req = service.buildCreatePriceRequest('prod_test123', 2500, 'usd');
Assert.isTrue(req.getEndpoint().contains('api.stripe.com/v1/prices'), 'Endpoint must contain api.stripe.com/v1/prices');`,
  // Test 2 - method
  `StripePriceService service = new StripePriceService();
HttpRequest req = service.buildCreatePriceRequest('prod_test123', 2500, 'usd');
Assert.areEqual('POST', req.getMethod(), 'Method must be POST');`,
  // Test 3 - auth
  `StripePriceService service = new StripePriceService();
HttpRequest req = service.buildCreatePriceRequest('prod_test123', 2500, 'usd');
Assert.isTrue(req.getHeader('Authorization').startsWith('Bearer'), 'Authorization header must start with Bearer');`,
  // Test 4 - body product
  `StripePriceService service = new StripePriceService();
HttpRequest req = service.buildCreatePriceRequest('prod_test123', 2500, 'usd');
Assert.isTrue(req.getBody().contains('product'), 'Body must contain product parameter');`,
  // Test 5 - body unit_amount
  `StripePriceService service = new StripePriceService();
HttpRequest req = service.buildCreatePriceRequest('prod_test123', 2500, 'usd');
Assert.isTrue(req.getBody().contains('unit_amount'), 'Body must contain unit_amount parameter');`,
  // Test 6 - body currency
  `StripePriceService service = new StripePriceService();
HttpRequest req = service.buildCreatePriceRequest('prod_test123', 2500, 'usd');
Assert.isTrue(req.getBody().contains('currency'), 'Body must contain currency parameter');`,
  // Test 7 - getPricesByProduct (uses real product from StripeProductService)
  `StripeProductService prodService = new StripeProductService();
Product2 testProduct = new Product2(Name = 'Price Test Product', Description = 'Testing prices');
String prodResponse = prodService.createProduct(testProduct);
Map<String, Object> prodData = (Map<String, Object>) JSON.deserializeUntyped(prodResponse);
String productId = (String) prodData.get('id');
StripePriceService service = new StripePriceService();
List<Map<String, Object>> prices = service.getPricesByProduct(productId);
Assert.isNotNull(prices, 'Should return a list (can be empty)');`
];

const TASK5_REQUIREMENTS = [
  "The buildCreatePriceRequest method returns an HttpRequest with endpoint containing api.stripe.com/v1/prices",
  "The buildCreatePriceRequest method returns an HttpRequest with method set to POST",
  "The buildCreatePriceRequest method returns an HttpRequest with Authorization header starting with Bearer",
  "The buildCreatePriceRequest method returns an HttpRequest with body containing product",
  "The buildCreatePriceRequest method returns an HttpRequest with body containing unit_amount",
  "The buildCreatePriceRequest method returns an HttpRequest with body containing currency",
  "The getPricesByProduct method returns a list (requires working StripeProductService)"
];

// Also fix task 5 description - currency -> currencyCode
const TASK5_DESC = `Create a class named StripePriceService that integrates with the Stripe API to manage prices for products.

Note: Prices require an existing product. Create a product first using StripeProductService or use an existing product ID from your Stripe dashboard.

The class must have 3 methods:

1. buildCreatePriceRequest(String productId, Integer unitAmount, String currencyCode) - Returns an HttpRequest configured to create a price in Stripe
   - Endpoint: https://api.stripe.com/v1/prices
   - Method: POST
   - Headers: Authorization with your API key, Content-Type as application/x-www-form-urlencoded
   - Body: product=<productId>&unit_amount=<unitAmount>&currency=<currencyCode>

2. createPrice(String productId, Integer unitAmount, String currencyCode) - Creates a price in Stripe and returns the response body as String

3. getPricesByProduct(String productId) - Lists all prices for a product and returns a List<Map<String, Object>>
   - Endpoint: https://api.stripe.com/v1/prices?product=<productId>
   - Method: GET`;

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
    console.log(`✅ Task ${i + 1} (${taskIds[i]}): req/test ${t.requirements.length}/${t.tests.length}`);
  }

  // Verify new counts match
  if (TASK4_TESTS.length !== TASK4_REQUIREMENTS.length) {
    console.log(`❌ Task 4 mismatch: ${TASK4_REQUIREMENTS.length} reqs / ${TASK4_TESTS.length} tests`);
    await client.close(); return;
  }
  if (TASK5_TESTS.length !== TASK5_REQUIREMENTS.length) {
    console.log(`❌ Task 5 mismatch: ${TASK5_REQUIREMENTS.length} reqs / ${TASK5_TESTS.length} tests`);
    await client.close(); return;
  }
  console.log(`\n✅ All validated\n`);

  // STEP 1: Set order 1-5
  console.log('========== STEP 1: SET ORDER 1-5 ==========\n');
  for (let i = 0; i < taskIds.length; i++) {
    const result = await tasks.updateOne(
      { _id: new ObjectId(taskIds[i]) },
      { $set: { order: i + 1 } }
    );
    console.log(`  Task ${i + 1}: ${result.modifiedCount === 1 ? '✅ order set' : '⚠️  no change'}`);
  }

  // STEP 2: Fix Task 4 tests + requirements
  console.log('\n========== STEP 2: FIX TASK 4 ==========\n');
  const r4 = await tasks.updateOne(
    { _id: new ObjectId(TASK4_ID) },
    { $set: { tests: TASK4_TESTS, requirements: TASK4_REQUIREMENTS } }
  );
  console.log(`  Task 4 tests+reqs: ${r4.modifiedCount === 1 ? '✅' : '⚠️ '}`);

  // STEP 3: Fix Task 5 solution + tests + requirements + description + delta
  console.log('\n========== STEP 3: FIX TASK 5 (currency -> currencyCode + tests) ==========\n');
  const r5 = await tasks.updateOne(
    { _id: new ObjectId(TASK5_ID) },
    { $set: {
      solution: TASK5_SOLUTION,
      tests: TASK5_TESTS,
      requirements: TASK5_REQUIREMENTS,
      description: TASK5_DESC,
      delta: [{ insert: TASK5_DESC + '\n' }]
    }}
  );
  console.log(`  Task 5 full update: ${r5.modifiedCount === 1 ? '✅' : '⚠️ '}`);

  // VERIFICATION
  console.log('\n========== VERIFICATION ==========\n');
  for (let i = 0; i < taskIds.length; i++) {
    const t = await tasks.findOne({ _id: new ObjectId(taskIds[i]) });
    const hasOrder = t.order === (i + 1) ? '✅' : '❌';
    const reqTestMatch = t.requirements.length === t.tests.length ? '✅' : '❌';
    const deltaMatch = t.delta && t.delta[0] && t.delta[0].insert.trim() === t.description.trim() ? '✅' : '❌';
    const noCurrencyParam = !t.solution.includes('String currency)') ? '✅' : '❌';
    const noFakeIds = !t.tests.join('\n').includes('cus_test123') || i < 3 ? '✅' : '❌'; // tasks 1-3 can have fake IDs in non-callout tests
    console.log(`  Task ${i + 1} | order:${hasOrder} | req/test:${reqTestMatch} ${t.requirements.length}/${t.tests.length} | delta:${deltaMatch} | noCurrency:${noCurrencyParam}`);
  }

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
