HttpRequest request = new HttpRequest();
request.setEndpoint('https://pokeapi.co/api/v2/pokemon/pikachu');
request.setMethod('GET');
Http http = new Http();
HttpResponse response = http.send(request);
Object result = JSON.deserializeUntyped(response.getBody());
Assert.isNotNull(result, 'Deserialized result must not be null');
