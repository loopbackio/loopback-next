# Feature: Routing

- In order to build REST APIs
- As an app developer
- I want the framework to handle the request to controller method routing
- So that I can focus on my implementing the methods and not the routing

## Scenario: Basic Usage

- Given an `Application`
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
    '/echo': {
      'x-operation-id': 'echo',
      get: {
        responses: {
          200: {
            type: 'string'
          }
        }
      }
    }
  }
})
class MyController extends Controller {
  public echo(msg : string) : string {
    return msg;
  }
}

app.bind('controllers.myController').to(MyController);
server.bind('applications.myApp').to(app);

await server.start();
await client.get('/?msg=hello&20world'); // => {status: 200, response: {body: 'hello world'}}
```
