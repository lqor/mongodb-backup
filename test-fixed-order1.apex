HttpRequest request = new HttpRequest();
request.setEndpoint('https://pokeapi.co/api/v2/pokemon/pikachu');
Assert.areEqual('https://pokeapi.co/api/v2/pokemon/pikachu', request.getEndpoint(), 'Endpoint must be the Pikachu API URL');
