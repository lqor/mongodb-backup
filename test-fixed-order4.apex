HttpRequest request = new HttpRequest();
request.setEndpoint('https://pokeapi.co/api/v2/pokemon/pikachu');
request.setMethod('GET');
Http http = new Http();
HttpResponse response = http.send(request);
Integer statusCode = response.getStatusCode();
Assert.areEqual(200, statusCode, 'Status code must be 200');
