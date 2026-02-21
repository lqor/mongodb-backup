HttpRequest request = new HttpRequest();
request.setEndpoint('https://pokeapi.co/api/v2/pokemon/pikachu');
request.setMethod('GET');
Http http = new Http();
HttpResponse response = http.send(request);
Map<String, Object> pokemon = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
String name = (String) pokemon.get('name');
Integer height = (Integer) pokemon.get('height');
Assert.isTrue(height > 0, 'Height must be greater than 0');
