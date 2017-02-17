## Scenario: Unlocking

- Given an empty `Context` (binding container)
- And a binding that is `locked`
- When I unlock the binding
- And create another binding with the same name
- Then my new binding overwrites the old binding

```ts
// create a container for bindings
let ctx = new Context();

// creating a simple binding
let binding = ctx.bind('foo').to('bar');

// that is protected
binding.lock();

// unlock the binding
binding.unlock();

// rebind does not throw
ctx.bind('foo').to('baz');

// new value is baz
console.log(ctx.get('foo')); // => baz
```

## Scenario: Dynamic Bindings

- Given a binding container
- And a dynamic binding named `data` with values `a`, `b`, `c`
- When I resolve the binding for `data` three times
- Then I get the value `a`
- And then I get the value `b`
- And then I get the value `c`

```ts
// create a container for bindings
let ctx = new Context();
let data = ['a', 'b', 'c'];

// creating a dynamic binding
ctx.bind('data').toDynamicValue(() => {
  return data.shift();
});

ctx.get('data'); // => a
ctx.get('data'); // => b
ctx.get('data'); // => c
```



## Scenario: Tags

- Given two simple object bindings
- And both bindings are tagged with the same tag
- When I find all bindings by the tag name
- Then I get both bindings

```ts
// create a container for bindings
let animals = new Context();

animals.bind('spot').to(new Dog()).tag('dog');
animals.bind('fido').to(new Dog()).tag('dog');

let dogs = animals.findByTag('dog');
```

## Scenario: Inherited Binding Resolution

- Given an empty `Context`
- And a child `Context`
- And a parent binding
- When I get the value for a binding of the child
- The binding resolves to the parent binding

```ts
let ctx = new Context();
let child = new Context();
ctx.addChild(child);

ctx.bind('foo').to('bar');

child.get('foo'); // => 'bar'
```

## Scenario: Simple Paramaterized Binding

- Given a simple parameterized binding
- When I get the value with a specific key
- The binding is resovled

```ts
let ctx = new Context();
ctx.bind(':name').to('hello world')

ctx.get('foo'); // => hello world
ctx.get('bat'); // => hello world
```

## Scenario: Simple Dynamic Paramaterized Binding

- Given a simple parameterized binding
- When I get the value with a specific key
- The binding is resovled with the corresponding value

```ts
let ctx = new Context();
let data = {
  foo: 'bar',
  bat: 'baz'
};

ctx.bind(':name').to((name) => {
  return data[name];
});

ctx.get('foo'); // => bar
ctx.get('bat'); // => baz
```

## Scenario: Namespaced Paramaterized Binding

- Given a complex parameterized binding
- When I get the value with a specific key
- The binding is resovled

```ts
let ctx = new Context();
ctx.bind('foo.:name').to('hello world');

ctx.get('foo.bar'); // => hello world
ctx.get('foo.bat'); // => hello world
```

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
