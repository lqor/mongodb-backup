const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

const TOPIC_ID = '6990bbd44dc3a532eb9ed4b0';

const CHANGES = {
  '6990d729dda409bac9885ed7': { // order 10
    description: "Complete the code to extract the 'name' value as a String and the 'height' value as an Integer from the pokemon map. The API call and deserialization are already done for you. You can explore all available fields at https://pokeapi.co/api/v2/pokemon/pikachu",
    requirements: [
      "The deserialized pokemon map must not be null",
      "The name extracted from the Pikachu response must equal 'pikachu'",
      "The height extracted from the Pikachu response must be greater than 0"
    ]
  },
  '6990d729dda409bac9885ed8': { // order 11
    description: "Complete the code to extract the 'base_experience' value as an Integer from the pokemon map. This field shows how much experience a trainer gains when defeating this Pokemon. You can explore all available fields at https://pokeapi.co/api/v2/pokemon/pikachu",
    requirements: [
      "The deserialized pokemon map must not be null",
      "The base_experience value extracted from the Pikachu response must be greater than 0"
    ]
  },
  '6990d729dda409bac9885ed9': { // order 12
    description: "Complete the code by filling in the correct cast to List<Object>. Not all fields in the Pokemon response are simple values - the 'types' field is a list of objects. You can explore the full structure at https://pokeapi.co/api/v2/pokemon/pikachu",
    requirements: [
      "The types list extracted from the Pikachu response must not be empty"
    ]
  },
  '6990d729dda409bac9885eda': { // order 13
    description: "Complete the code to get the type name from the Pokemon response. The 'types' field contains a list of nested objects. Each entry looks like this: {\"slot\": 1, \"type\": {\"name\": \"electric\"}}. To get the type name, go step by step: get the types list, get the first entry as a Map, get the 'type' object as a Map, then get the 'name' as a String. You can explore the full structure at https://pokeapi.co/api/v2/pokemon/pikachu",
    requirements: [
      "The types list extracted from the pokemon map must not be empty",
      "The first entry in the types list must not be null",
      "The 'type' object inside the first entry must not be null",
      "The type name for Pikachu must be 'electric'"
    ],
    solution: `HttpRequest request = new HttpRequest();
request.setEndpoint('https://pokeapi.co/api/v2/pokemon/pikachu');
request.setMethod('GET');
Http http = new Http();
HttpResponse response = http.send(request);
Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
List<Object> types = (List<Object>) pokemon.get('types');
Map<String, Object> firstType = (Map<String, Object>) types.get(0);
Map<String, Object> typeInfo = (Map<String, Object>) firstType.get('type');
String typeName = (String) typeInfo.get('name');`
  },
  '6990d73c5b5c7cbef54ad84e': { // order 14
    description: "Create a PokemonFetcher class with a fetchPokemon method. The method takes a String parameter 'pokemonName', sends a GET request to https://pokeapi.co/api/v2/pokemon/ + pokemonName, and returns the response body as a String. Make sure https://pokeapi.co is in your Remote Site Settings.",
    requirements: [
      "A public class named 'PokemonFetcher' must exist",
      "fetchPokemon('pikachu') must return a non-null String",
      "fetchPokemon('pikachu') must return a response containing 'pikachu'",
      "fetchPokemon('charizard') must return a response containing 'charizard'"
    ]
  },
  '6990d73c5b5c7cbef54ad84f': { // order 15
    description: "Create a PokemonParser class with a getName method. The method takes a Pokemon JSON string as a parameter, deserializes it using JSON.deserializeUntyped(), casts the result to Map<String, Object>, and returns the 'name' value as a String. Every Pokemon from the API has the same JSON structure - you can explore it at https://pokeapi.co/api/v2/pokemon/pikachu",
    requirements: [
      "A public class named 'PokemonParser' must exist",
      "If the input is '{\"name\":\"pikachu\",\"weight\":60}' then getName must return 'pikachu'",
      "If the input is '{\"name\":\"charizard\",\"weight\":905}' then getName must return 'charizard'"
    ]
  },
  '6990d73c5b5c7cbef54ad850': { // order 16
    description: "Add a getWeight method to your PokemonParser class. The method takes a Pokemon JSON string as a parameter, deserializes it, and returns the 'weight' value as an Integer. Weight is measured in hectograms - you can check the values at https://pokeapi.co/api/v2/pokemon/pikachu",
    requirements: [
      "A public class named 'PokemonParser' must exist",
      "If the input is '{\"name\":\"pikachu\",\"weight\":60,\"height\":4}' then getWeight must return 60",
      "If the input is '{\"name\":\"charizard\",\"weight\":905,\"height\":17}' then getWeight must return 905"
    ]
  },
  '6990d73c5b5c7cbef54ad851': { // order 17
    description: "Add a getHeight method to your PokemonParser class. The method takes a Pokemon JSON string as a parameter, deserializes it, and returns the 'height' value as an Integer. Height is measured in decimeters - you can check the values at https://pokeapi.co/api/v2/pokemon/pikachu",
    requirements: [
      "A public class named 'PokemonParser' must exist",
      "If the input is '{\"name\":\"pikachu\",\"weight\":60,\"height\":4}' then getHeight must return 4",
      "If the input is '{\"name\":\"charizard\",\"weight\":905,\"height\":17}' then getHeight must return 17"
    ]
  },
  '6990d73c5b5c7cbef54ad852': { // order 18
    description: "Add a getTypeName method to your PokemonParser class. The method takes a Pokemon JSON string as a parameter and returns the first type name as a String. The types field has a nested structure - you can explore it at https://pokeapi.co/api/v2/pokemon/pikachu",
    requirements: [
      "A public class named 'PokemonParser' must exist",
      "If the input contains types [{'type':{'name':'electric'}}] then getTypeName must return 'electric'",
      "If the input contains types [{'type':{'name':'fire'}}] then getTypeName must return 'fire'"
    ],
    solution: `public class PokemonParser {
    public String getTypeName(String jsonBody) {
        Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(jsonBody);
        List<Object> types = (List<Object>) pokemon.get('types');
        Map<String, Object> firstType = (Map<String, Object>) types.get(0);
        Map<String, Object> typeInfo = (Map<String, Object>) firstType.get('type');
        return (String) typeInfo.get('name');
    }
}`
  },
  '6990d73c5b5c7cbef54ad853': { // order 19
    description: "Create a complete PokemonParser class with all four methods: getName, getWeight, getHeight, and getTypeName. Each method takes a Pokemon JSON string and returns the matching value. You can explore the JSON structure at https://pokeapi.co/api/v2/pokemon/pikachu",
    requirements: [
      "A public class named 'PokemonParser' must exist",
      "getName must return 'pikachu' when given pikachu JSON data",
      "getWeight must return 60 when given pikachu JSON data (weight in hectograms)",
      "getHeight must return 4 when given pikachu JSON data (height in decimeters)",
      "getTypeName must return 'electric' when given pikachu JSON data"
    ],
    solution: `public class PokemonParser {
    public String getName(String jsonBody) {
        Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(jsonBody);
        return (String) pokemon.get('name');
    }

    public Integer getWeight(String jsonBody) {
        Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(jsonBody);
        return (Integer) pokemon.get('weight');
    }

    public Integer getHeight(String jsonBody) {
        Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(jsonBody);
        return (Integer) pokemon.get('height');
    }

    public String getTypeName(String jsonBody) {
        Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(jsonBody);
        List<Object> types = (List<Object>) pokemon.get('types');
        Map<String, Object> firstType = (Map<String, Object>) types.get(0);
        Map<String, Object> typeInfo = (Map<String, Object>) firstType.get('type');
        return (String) typeInfo.get('name');
    }
}`
  },
  '6990d73c5b5c7cbef54ad854': { // order 20
    description: "We are going to build a PokemonService class step by step over the next few tasks. This class combines fetching and parsing into one reusable service. Create a PokemonService class with a BASE_URL constant and a getPokemon method. The method sends a GET request to the Pokemon API and returns the deserialized response as a Map. Make sure https://pokeapi.co is in your Remote Site Settings.",
    requirements: [
      "A public class named 'PokemonService' must exist",
      "PokemonService.BASE_URL must equal 'https://pokeapi.co/api/v2'",
      "getPokemon('pikachu') must return a map where the 'name' value is 'pikachu'",
      "getPokemon('charizard') must return a map where the 'name' value is 'charizard'"
    ]
  },
  '6990d73c5b5c7cbef54ad855': { // order 21
    description: "Add a getPokemonWeight method to your PokemonService class from the previous task. The method takes a pokemon name and returns its weight as an Integer.",
    requirements: [
      "getPokemonWeight('pikachu') must return a positive Integer",
      "getPokemonWeight('charizard') must return a positive Integer"
    ]
  },
  '6990d73c5b5c7cbef54ad856': { // order 22
    description: "Add a getPokemonHeight method to your PokemonService class. The method takes a pokemon name and returns its height as an Integer.",
    requirements: [
      "getPokemonHeight('pikachu') must return a positive Integer",
      "getPokemonHeight('charizard') must return a positive Integer"
    ]
  },
  '6990d73c5b5c7cbef54ad857': { // order 23
    description: "Add a getPokemonType method to your PokemonService class. The method takes a pokemon name and returns its first type name as a String. For example, Pikachu's type is 'electric' and Charizard's type is 'fire'.",
    requirements: [
      "getPokemonType('pikachu') must return 'electric'",
      "getPokemonType('charizard') must return 'fire'"
    ],
    solution: `public class PokemonService {
    public static final String BASE_URL = 'https://pokeapi.co/api/v2';

    public Map<String, Object> getPokemon(String pokemonName) {
        HttpRequest request = new HttpRequest();
        request.setEndpoint(BASE_URL + '/pokemon/' + pokemonName);
        request.setMethod('GET');
        Http http = new Http();
        HttpResponse response = http.send(request);
        return (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
    }

    public Integer getPokemonWeight(String pokemonName) {
        Map<String, Object> pokemon = getPokemon(pokemonName);
        return (Integer) pokemon.get('weight');
    }

    public Integer getPokemonHeight(String pokemonName) {
        Map<String, Object> pokemon = getPokemon(pokemonName);
        return (Integer) pokemon.get('height');
    }

    public String getPokemonType(String pokemonName) {
        Map<String, Object> pokemon = getPokemon(pokemonName);
        List<Object> types = (List<Object>) pokemon.get('types');
        Map<String, Object> firstType = (Map<String, Object>) types.get(0);
        Map<String, Object> typeInfo = (Map<String, Object>) firstType.get('type');
        return (String) typeInfo.get('name');
    }
}`
  },
  '6990d73c5b5c7cbef54ad858': { // order 24
    description: "This is the final task! Verify your complete PokemonService class works with all methods. This time we test with Bulbasaur to make sure your code works for any Pokemon. Make sure https://pokeapi.co is in your Remote Site Settings.",
    requirements: [
      "A public class named 'PokemonService' must exist",
      "PokemonService.BASE_URL must equal 'https://pokeapi.co/api/v2'",
      "getPokemon('bulbasaur') must return a map where the 'name' value is 'bulbasaur'",
      "getPokemonWeight('bulbasaur') must return a positive Integer",
      "getPokemonHeight('bulbasaur') must return a positive Integer",
      "getPokemonType('bulbasaur') must return 'grass'"
    ],
    solution: `public class PokemonService {
    public static final String BASE_URL = 'https://pokeapi.co/api/v2';

    public Map<String, Object> getPokemon(String pokemonName) {
        HttpRequest request = new HttpRequest();
        request.setEndpoint(BASE_URL + '/pokemon/' + pokemonName);
        request.setMethod('GET');
        Http http = new Http();
        HttpResponse response = http.send(request);
        return (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
    }

    public Integer getPokemonWeight(String pokemonName) {
        Map<String, Object> pokemon = getPokemon(pokemonName);
        return (Integer) pokemon.get('weight');
    }

    public Integer getPokemonHeight(String pokemonName) {
        Map<String, Object> pokemon = getPokemon(pokemonName);
        return (Integer) pokemon.get('height');
    }

    public String getPokemonType(String pokemonName) {
        Map<String, Object> pokemon = getPokemon(pokemonName);
        List<Object> types = (List<Object>) pokemon.get('types');
        Map<String, Object> firstType = (Map<String, Object>) types.get(0);
        Map<String, Object> typeInfo = (Map<String, Object>) firstType.get('type');
        return (String) typeInfo.get('name');
    }
}`
  }
};

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');
  const tasks = db.collection('tasks');

  console.log('========== PRE-FLIGHT CHECKS ==========\n');

  // Verify all tasks exist and req/test counts will match
  for (const [taskId, change] of Object.entries(CHANGES)) {
    const t = await tasks.findOne({ _id: new ObjectId(taskId) });
    if (!t) { console.log(`❌ Task ${taskId} not found!`); await client.close(); return; }
    if (change.requirements.length !== t.tests.length) {
      console.log(`❌ Task ${taskId} (order ${t.order}): new req count ${change.requirements.length} != existing test count ${t.tests.length}`);
      await client.close();
      return;
    }
    if (change.solution && change.solution.includes('System.debug')) {
      console.log(`❌ Task ${taskId} (order ${t.order}): System.debug in new solution`);
      await client.close();
      return;
    }
    if (change.solution && change.solution.includes('System.assert')) {
      console.log(`❌ Task ${taskId} (order ${t.order}): System.assert in new solution`);
      await client.close();
      return;
    }
    if (change.solution && change.solution.includes('types[0]')) {
      console.log(`❌ Task ${taskId} (order ${t.order}): types[0] bracket notation in new solution`);
      await client.close();
      return;
    }
    console.log(`✅ Task order ${t.order} (${taskId}): ${change.requirements.length} reqs = ${t.tests.length} tests${change.solution ? ' + solution fix' : ''}`);
  }

  console.log(`\n✅ All ${Object.keys(CHANGES).length} tasks validated\n`);

  console.log('========== APPLYING CHANGES ==========\n');

  for (const [taskId, change] of Object.entries(CHANGES)) {
    const updateFields = {
      description: change.description,
      delta: [{ insert: change.description + '\n' }],
      requirements: change.requirements
    };
    if (change.solution) {
      updateFields.solution = change.solution;
    }

    const result = await tasks.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: updateFields }
    );
    const t = await tasks.findOne({ _id: new ObjectId(taskId) });
    console.log(result.modifiedCount === 1
      ? `✅ Order ${t.order}: updated description, requirements, delta${change.solution ? ', solution' : ''}`
      : `⚠️  Order ${t.order}: no change (may already be correct)`);
  }

  console.log('\n========== VERIFICATION ==========\n');

  const allTasks = await tasks.find({ ref: TOPIC_ID, testMode: { $ne: true }, order: { $gte: 10 } }).sort({ order: 1 }).toArray();
  for (const t of allTasks) {
    const reqTestMatch = t.requirements.length === t.tests.length ? '✅' : '❌';
    const deltaMatch = t.delta[0].insert.trim() === t.description.trim() ? '✅' : '❌';
    const noBracket = !t.solution.includes('types[0]') ? '✅' : '❌';
    const noDebug = !t.solution.includes('System.debug') ? '✅' : '❌';
    console.log(`  Order ${t.order} | req/test:${reqTestMatch} ${t.requirements.length}/${t.tests.length} | delta:${deltaMatch} | no[0]:${noBracket} | noDebug:${noDebug} | "${t.description.substring(0, 60)}..."`);
  }

  await client.close();
  console.log('\nDone!');
}

main().catch(console.error);
