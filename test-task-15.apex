// === TASK 15: Dynamic endpoint with pokemonName variable ===
// PreCode (provided by platform):
String pokemonName = 'charizard';

// Solution:
HttpRequest request = new HttpRequest();
request.setEndpoint('https://pokeapi.co/api/v2/pokemon/' + pokemonName);
request.setMethod('GET');

// Test 1:
Assert.areEqual('https://pokeapi.co/api/v2/pokemon/charizard', request.getEndpoint(), 'Endpoint must include the pokemon name dynamically');

System.debug('✅ Task 15 PASSED — endpoint: ' + request.getEndpoint());
