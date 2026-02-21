HttpRequest request = new HttpRequest();
request.setEndpoint('https://pokeapi.co/api/v2/pokemon/pikachu');
request.setMethod('GET');
Http http = new Http();
HttpResponse response = http.send(request);
String body = response.getBody();
Assert.isTrue(body.length() > 0, 'Response body must not be empty');
