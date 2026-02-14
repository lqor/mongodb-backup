// ============================================================
// TASK 15: PokemonFetcher class — fetchPokemon method (orgCode: true)
// User creates the class in their org, then run these tests:
// ============================================================
PokemonFetcher fetcher = new PokemonFetcher();
Assert.isNotNull(fetcher, 'PokemonFetcher class must exist');
String result1 = fetcher.fetchPokemon('pikachu');
Assert.isNotNull(result1, 'fetchPokemon must return a String');
Assert.isTrue(result1.contains('pikachu'), 'Response body must contain pikachu');
String result2 = fetcher.fetchPokemon('charizard');
Assert.isTrue(result2.contains('charizard'), 'fetchPokemon must work with different pokemon names');
System.debug('✅ Task 15 PASSED');


// ============================================================
// TASK 16: PokemonParser — getName method (orgCode: false)
// This runs as anonymous Apex with the template provided
// ============================================================
// Solution inside class template:
public class PokemonParser {
    public String getName(String jsonBody) {
        Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(jsonBody);
        return (String) pokemon.get('name');
    }
}

// Tests:
PokemonParser parser = new PokemonParser();
Assert.isNotNull(parser, 'PokemonParser class must exist');
String r16a = parser.getName('{"name":"pikachu","weight":60}');
Assert.isNotNull(r16a, 'getName must return a String');
Assert.areEqual('pikachu', r16a, 'getName must return the pokemon name');
System.debug('✅ Task 16 PASSED');


// ============================================================
// TASK 17: PokemonParser — getWeight method (orgCode: false)
// ============================================================
public class PokemonParser {
    public Integer getWeight(String jsonBody) {
        Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(jsonBody);
        return (Integer) pokemon.get('weight');
    }
}

PokemonParser parser = new PokemonParser();
Assert.isNotNull(parser, 'PokemonParser class must exist');
Integer r17a = parser.getWeight('{"name":"pikachu","weight":60,"height":4}');
Assert.isNotNull(r17a, 'getWeight must return an Integer');
Assert.areEqual(60, r17a, 'getWeight must return the correct weight');
System.debug('✅ Task 17 PASSED');


// ============================================================
// TASK 18: PokemonParser — getHeight method (orgCode: false)
// ============================================================
public class PokemonParser {
    public Integer getHeight(String jsonBody) {
        Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(jsonBody);
        return (Integer) pokemon.get('height');
    }
}

PokemonParser parser = new PokemonParser();
Assert.isNotNull(parser, 'PokemonParser class must exist');
Integer r18a = parser.getHeight('{"name":"pikachu","weight":60,"height":4}');
Assert.isNotNull(r18a, 'getHeight must return an Integer');
Assert.areEqual(4, r18a, 'getHeight must return the correct height');
System.debug('✅ Task 18 PASSED');


// ============================================================
// TASK 19: PokemonParser — getTypeName method (orgCode: false)
// ============================================================
public class PokemonParser {
    public String getTypeName(String jsonBody) {
        Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(jsonBody);
        List<Object> types = (List<Object>) pokemon.get('types');
        Map<String, Object> firstType = (Map<String, Object>) types[0];
        Map<String, Object> typeInfo = (Map<String, Object>) firstType.get('type');
        return (String) typeInfo.get('name');
    }
}

PokemonParser parser = new PokemonParser();
Assert.isNotNull(parser, 'PokemonParser class must exist');
String r19a = parser.getTypeName('{"name":"pikachu","types":[{"slot":1,"type":{"name":"electric"}}]}');
Assert.isNotNull(r19a, 'getTypeName must return a String');
Assert.areEqual('electric', r19a, 'getTypeName must return the first type name');
System.debug('✅ Task 19 PASSED');


// ============================================================
// TASK 20: PokemonParser — all 4 methods together (orgCode: true)
// User creates the class in their org, then run these tests:
// ============================================================
PokemonParser parser = new PokemonParser();
Assert.isNotNull(parser, 'PokemonParser class must exist');
String json20 = '{"name":"pikachu","weight":60,"height":4,"types":[{"slot":1,"type":{"name":"electric"}}]}';
Assert.areEqual('pikachu', parser.getName(json20), 'getName must return pikachu');
Assert.areEqual(60, parser.getWeight(json20), 'getWeight must return 60');
Assert.areEqual(4, parser.getHeight(json20), 'getHeight must return 4');
Assert.areEqual('electric', parser.getTypeName(json20), 'getTypeName must return electric');
System.debug('✅ Task 20 PASSED');


// ============================================================
// TASK 21: PokemonService — BASE_URL + getPokemon (orgCode: true)
// User creates the class in their org, then run these tests:
// ============================================================
PokemonService service = new PokemonService();
Assert.isNotNull(service, 'PokemonService class must exist');
Assert.areEqual('https://pokeapi.co/api/v2', PokemonService.BASE_URL, 'BASE_URL must be https://pokeapi.co/api/v2');
Map<String, Object> r21 = service.getPokemon('pikachu');
Assert.isNotNull(r21, 'getPokemon must return a Map');
Assert.areEqual('pikachu', (String) r21.get('name'), 'getPokemon must return correct pokemon data');
System.debug('✅ Task 21 PASSED');


// ============================================================
// TASK 22: PokemonService + getPokemonWeight (orgCode: true)
// ============================================================
Assert.areEqual('https://pokeapi.co/api/v2', PokemonService.BASE_URL, 'BASE_URL must be correct');
PokemonService service = new PokemonService();
Map<String, Object> r22a = service.getPokemon('pikachu');
Assert.areEqual('pikachu', (String) r22a.get('name'), 'getPokemon must return correct data');
Integer r22b = service.getPokemonWeight('pikachu');
Assert.isTrue(r22b > 0, 'getPokemonWeight must return a positive Integer');
System.debug('✅ Task 22 PASSED');


// ============================================================
// TASK 23: PokemonService + getPokemonHeight (orgCode: true)
// ============================================================
Assert.areEqual('https://pokeapi.co/api/v2', PokemonService.BASE_URL, 'BASE_URL must be correct');
PokemonService service = new PokemonService();
Map<String, Object> r23a = service.getPokemon('pikachu');
Assert.areEqual('pikachu', (String) r23a.get('name'), 'getPokemon must return correct data');
Integer r23b = service.getPokemonHeight('pikachu');
Assert.isTrue(r23b > 0, 'getPokemonHeight must return a positive Integer');
System.debug('✅ Task 23 PASSED');


// ============================================================
// TASK 24: PokemonService + getPokemonType (orgCode: true)
// ============================================================
Assert.areEqual('https://pokeapi.co/api/v2', PokemonService.BASE_URL, 'BASE_URL must be correct');
PokemonService service = new PokemonService();
Map<String, Object> r24a = service.getPokemon('pikachu');
Assert.areEqual('pikachu', (String) r24a.get('name'), 'getPokemon must return correct data');
String r24b = service.getPokemonType('pikachu');
Assert.areEqual('electric', r24b, 'getPokemonType must return electric for pikachu');
System.debug('✅ Task 24 PASSED');


// ============================================================
// TASK 25: Full PokemonService (orgCode: true)
// ============================================================
PokemonService service = new PokemonService();
Assert.isNotNull(service, 'PokemonService class must exist');
Assert.areEqual('https://pokeapi.co/api/v2', PokemonService.BASE_URL, 'BASE_URL must be correct');
Map<String, Object> r25 = service.getPokemon('pikachu');
Assert.areEqual('pikachu', (String) r25.get('name'), 'getPokemon must return correct data');
Assert.isTrue(service.getPokemonWeight('pikachu') > 0, 'getPokemonWeight must return positive');
Assert.isTrue(service.getPokemonHeight('pikachu') > 0, 'getPokemonHeight must return positive');
Assert.areEqual('electric', service.getPokemonType('pikachu'), 'getPokemonType must return electric');
System.debug('✅ Task 25 PASSED');
