HttpRequest request = new HttpRequest();
request.setEndpoint('https://pokeapi.co/api/v2/pokemon/pikachu');
request.setMethod('GET');
Assert.areEqual('GET', request.getMethod(), 'HTTP method must be GET');
