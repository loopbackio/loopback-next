# Feature: Routing

- In order to build REST APIs
- As an app developer
- I want the framewor to handle the request to controller method routing
- So that I can focus on my implementing the methods and not the routing

## Scenario: Basic Usage

- Given an `Application` with
- And a single `Controller`
- And a single `Method` that returns the string `hello world`
- When I make a request to the `Application`
- Then I get the result `hello world` from the `Method`

```ts
let app = new Application();
let server = new Server();
let client = new Client(server.url);

@api({
  baseUrl: '/',
  {
    '/greet': {
      controllerMethod: 'greet',
      get: {
        responses: {
          type: 'string'
        }
      }
    }
  }
})
class MyController extends Controller {
  public greet() : string {
    return 'hello world';
  }
}

app.bind('controllers.myController').to(MyController);
server.bind('applications.myApp').toConstantValue(app);

await server.start();
await client.get('/'); // => 'hello world'
```
