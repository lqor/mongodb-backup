// === TASK 14: Navigate nested types to get type name ===
// Solution:
HttpRequest request = new HttpRequest();
request.setEndpoint('https://pokeapi.co/api/v2/pokemon/pikachu');
request.setMethod('GET');
Http http = new Http();
HttpResponse response = http.send(request);
Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
List<Object> types = (List<Object>) pokemon.get('types');
Map<String, Object> firstType = (Map<String, Object>) types[0];
Map<String, Object> typeInfo = (Map<String, Object>) firstType.get('type');
String typeName = (String) typeInfo.get('name');

// Test 1:
Assert.isTrue(types.size() > 0, 'Types list must not be empty');

// Test 2:
Assert.isNotNull(firstType, 'First type entry must not be null');

// Test 3:
Assert.isNotNull(typeInfo, 'Type info object must not be null');

// Test 4:
Assert.areEqual('electric', typeName, 'Pikachu type name must be electric');

System.debug('✅ Task 14 PASSED — typeName: ' + typeName);
