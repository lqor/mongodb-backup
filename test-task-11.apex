// === TASK 11: Extract name AND height from Pikachu ===
// Solution:
HttpRequest request = new HttpRequest();
request.setEndpoint('https://pokeapi.co/api/v2/pokemon/pikachu');
request.setMethod('GET');
Http http = new Http();
HttpResponse response = http.send(request);
Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
String name = (String) pokemon.get('name');
Integer height = (Integer) pokemon.get('height');

// Test 1:
Assert.isNotNull(pokemon, 'pokemon map must not be null');

// Test 2:
Assert.areEqual('pikachu', name, 'Name must be pikachu');

// Test 3:
Assert.isTrue(height > 0, 'Height must be greater than 0');

System.debug('✅ Task 11 PASSED — name: ' + name + ', height: ' + height);
