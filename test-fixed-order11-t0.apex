HttpRequest request = new HttpRequest();
request.setEndpoint('https://pokeapi.co/api/v2/pokemon/pikachu');
request.setMethod('GET');
Http http = new Http();
HttpResponse response = http.send(request);
Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
Integer baseExp = (Integer) pokemon.get('base_experience');
Assert.isNotNull(pokemon, 'pokemon map must not be null');
