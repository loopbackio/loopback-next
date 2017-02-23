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

---

## TBD Scenario: LoopBack Routing

- See the code below for main use case of contexts

```ts
let app = new Context();
let server = new Server();
app.bind('definitions.controllers').to({
  foo: {
    path: './foo.controller.ts',
    name: 'FooController',
    baseUrl: '/foo'
  }
});


app
  .bind(':type.:name')
  .toDynamicValue((type, name) => {
    let ctrls = app.get('definitions.controllers');
    let def = ctrls[name];

    return require(def.path)[def.name];
  })
  .tag(':type');

app.bind('currentController').toDynamicValue(() => {
  let ctx = this;
  let url = this.get('url');
  let baseUrl = url.split('/')[1];

  let controllers = this.get('definitions.controllers');
  for (let key of Object.keys(controllers)) {
    if (controllers[name].baseUrl === baseUrl) {
      let Controller = this.get(`controllers.${name}`);
      return new Controller(ctx);
    }
  }
});

app.bind('currentMethod').toDynamicValue(() => {
  let controller = this.get('currentController');
  let remoteMethod = controller.getMethodForUrl(this.get('url'));
  return remoteMethod;
});


server.on('request', async (req, res) {
  let ctx = new Context();
  ctx.bind('url').to(req.url);
  ctx.bind('req.body').toPromise((reject, resolve) => {
    resolve({}); // parse body...
  });
  ctx.bind('req').to(req);

  let controller = ctx.get('currentController');

  // allow apps to create / customize bindings
  controller.bind();

  ctx.bind('result')
    .toPromise((reject, resolve, ctx) => {
      let method = ctx.get('currentMethod');
      let methodArgs = ctx.get('currentArgs');
      return method.invoke(args);
    })
    .memoize()
    .lock();

  res.send(await ctx.get('result'));
});
```
