# Feature: Bootstrapping the server

## Scenario: Single server with single application

- Given a `Server`
- And a single `Application` bound to that `Server`
- And a `EchoController` bound to the `Application`
- When I make a request to the `Server`
- Then the `Server` routes the request to the `EchoController` within the `Application`

```ts
import {Application, Server, Controller, api} from "loopback";

@api({
  baseUrl: '/',
  paths: {
    '/': {
      get: {
        responses: {
          200: 'string'
        }
      }
    }
  }
});
class EchoController extends Controller {
  public echo(msg : string) {
    return msg;
  }
}

let server = new Server();
let app = new Application();

server.bind('applications.myApp').to(app);
const echoController = new EchoController();
app.bind('controllers.echo').to(echoController);

await server.start();
let client = new Cient(server.info());
await client.get('/?msg=hello'); // => {status: 200, response: {body: 'hello'}}
```
