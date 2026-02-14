// === TASK 12: Extract base_experience from Pikachu ===
// Solution:
HttpRequest request = new HttpRequest();
request.setEndpoint('https://pokeapi.co/api/v2/pokemon/pikachu');
request.setMethod('GET');
Http http = new Http();
HttpResponse response = http.send(request);
Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
Integer baseExp = (Integer) pokemon.get('base_experience');

// Test 1:
Assert.isNotNull(pokemon, 'pokemon map must not be null');

// Test 2:
Assert.isTrue(baseExp > 0, 'base_experience must be greater than 0');

System.debug('✅ Task 12 PASSED — base_experience: ' + baseExp);
