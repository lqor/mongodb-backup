// === TASK 13: Cast 'types' to List<Object> ===
// Solution:
HttpRequest request = new HttpRequest();
request.setEndpoint('https://pokeapi.co/api/v2/pokemon/pikachu');
request.setMethod('GET');
Http http = new Http();
HttpResponse response = http.send(request);
Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
List<Object> types = (List<Object>) pokemon.get('types');

// Test 1:
Assert.isTrue(types.size() > 0, 'Types list must not be empty');

System.debug('✅ Task 13 PASSED — types count: ' + types.size());
