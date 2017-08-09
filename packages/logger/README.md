# LoopBack Next Programming

It was written to share my experience in early days of LoopBack Next core development.  It's more like a blog for LoopBack Next development than readme of a component.

Detailed technical description of LoopBack Next component development can be found on [the LoopBack Next wiki](https://github.com/strongloop/loopback-next/wiki/Writing-Components).  [Authentication README](https://github.com/strongloop/loopback-next/tree/master/packages/authentication) is also a great stuff to study when integrating the Authentication component to your application.


____________________________________________
# Introduction

Target audience of this blog is new LoopBack Next developers who have done LoopBack application development in the following environment:

- Nodejs v4, v6, or v8
- Using JavaScript, more precisely [ECMAScript 5](https://en.wikipedia.org/wiki/ECMAScript#5th_Edition),
  which means that no clear patterns of object oriented programming such as `class`, `implements` (abstract class), and `extends` (inheritance).  Instead, used [util.inherits](https://nodejs.org/docs/latest/api/util.html#util_util_inherits_constructor_superconstructor) everywhere.  For asynchronous programming, `async` package or `Promise` is our standard technique.
- Not using [TypeScript](https://www.typescriptlang.org/) -- no compile-time type checks; free-fall scripting. :-)

When I started to look around LoopBack Next code base, I quickly got confused.  A couple of examples among others:

First, the LoopBack Next source code does not look like JavaScript.  For example,

- What are the [square brackets](http://es6-features.org/#ComputedPropertyNames) around object property name?
```js
var obj = {
  [key]: 'Ted Johnson',
}
```
- I see how [the class](http://es6-features.org/#ClassDefinition) is defined.  My source code editor such as [VS Code](https://code.visualstudio.com/) various type definitions in mouse-over pop-ups, which is super cool, but what's that [@inject](https://www.typescriptlang.org/docs/handbook/decorators.html)?
```js
export class MyProvider implements Provider<Strategy> {
  constructor(
    @inject(bindingKey)
    metadata: Metadata,
  ) {}

  value() : ValueOrPromise<Strategy> {}
}
```
- Yeah, I know `async`, but wait, what's `await`?
```js
describe('api spec', () => {
  let app = createApp();
  let apiSpec = app.getApiSpec();

  it('is valid', async () => {
    await validateApiSpec(apiSpec);
  });
});
```

Secondly, there are several new technologies we use in LoopBack Next and each of them is significantly different from what I got used to.  Mentioned [ECMAScript 5](https://en.wikipedia.org/wiki/ECMAScript#5th_Edition) and [TypeScript](https://www.typescriptlang.org/) earlier; and [OpenAPI](https://www.openapis.org/) is another.  They are cool new technologies that make LoopBack Next shine, but I felt being pulled out of my comfort zone many times a day.

This blog will cover all those `conceptual roadblocks`(to me) in `Foundation` chapter in the first half of this blog, and `LoopBack Next` in the second half.  I thought it makes sense to spend the first half for the foundation technologies because "divide and conquer" seems to be the right strategy here, i.e., start from the most basic stuff that has much less dependencies and build the next layer on top of it.  At the same time, we want to keep the clear goal in mind, i.e., LoopBack Next programming so that we can selectively study key topics in the foundation technologies, move on to LoopBack Next space, then come back to the foundation when needed.

In the `LoopBack Next` chapter, our focus will be three core concepts: controllers, components, and sequence.

Alright, let's get the foundation techniques under the belt.



____________________________________________
# Foundation

I'm going to summarize a few key concepts and a list of tools I found useful.  That way, we can quickly understand the big picture without getting bogged down to details of each technology; and with the list of tools, we can go back to the details when needed.

LoopBack Next is built on TypeScript and OpenAPI.  TypeScript is built on ECMAScript 8.  Quickly browsing those technologies will help solidify our footage.

### [ECMAScript 8](https://en.wikipedia.org/wiki/ECMAScript#8th_Edition_-_ECMAScript_2017)

1. [ECMAScript 5 vs. 6 — New Features: Overview & Comparison](http://es6-features.org/#Constants) -- http://es6-features.org/#Constants 
2. [The ECMAScript 8 specification](https://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf) -- https://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
3. [async/await, a.k.a "async functions"](https://tc39.github.io/ecmascript-asyncawait/) -- https://tc39.github.io/ecmascript-asyncawait/

The ES5 vs. ES6 overview & comparison site was very helpful to me.  Reading through the short list of code comparison between ES5 and ES6 gave me a good perspective.  I still go back to the site occasionaly.  When I wanted to understand what's not covered there, I went to the spec and other options, but that rarely occurred.

`Async Functions and Await` is the notation LoopBack Next uses all over the place for asynchronous operations.  Great news to me was that the standard `try-catch` clause could be used to catch errors.  That is the ultimate.  Here is my historical view of `asynchronous operations` in Nodejs.

```js
/*
 * code pieces come here.
 *
 */
```

### [TypeScript](https://www.typescriptlang.org/) : Type System on ECMAScript 8

1. Getting Started With TypeScript -- https://basarat.gitbooks.io/typescript/docs/types/type-system.html
2. Declaration Files -- https://basarat.gitbooks.io/typescript/docs/types/ambient/d.ts.html
3. Decorators -- https://www.typescriptlang.org/docs/handbook/decorators.html

I like the `Getting Started With TypeScript` and have read from the beggining to the end.  By the way, when you need to `npm install passport`, make sure you've got the accompanying Type Definition file as well: `npm install -S @types/passport`

### [OpenAPI](https://www.openapis.org/)

1. https://editor.swagger.io

In LoopBack Next, we define all of our endpoints in a declarative fashion, namely, OpneAPI spec.  I found [the swagger editor](https://editor.swagger.io) very useful to study OpenAPI spec as well as to debug and build a complex API spec. 

Note (LoopBack Next specific): In a LoopBack Next app, typically you don't put the header portion of the api spec(see below) because LoopBack Next adds it in @api decorator (we'll discuss "decorator" later in this blog).  [The swagger editor](https://editor.swagger.io), which is out side of LoopBack Next, will complain without the header portion.
```js
{
  "swagger": "2.0",
  "basePath": "/",
  "info": {
    "title": "LoopBack Application",
    "version": "1.0.0",
  },
  paths:{
      ...
  }
}
```
Also note that LoopBack Next provides `validateApiSpec` in the testlab so that you can validate it in `npm test` of your app.  Isn't that cool?



____________________________________________
# LoopBack Next

We're going to study three key concepts: controller & API spec, components & providers, and custom sequence.  Working sample codes are available in several places, one of which is [Hello World](https://github.com/strongloop/loopback-next-hello-world).  I'm going to discuss specific conceptual roadblocks I stumbled upon.

Skeleton of the client code looks like this:
```js
  const app = new Application({
    components: [HisComponent],
   });
  app.controller(HelloWorldController);
  app.sequence(MySequence);
```

### Controllers and API spec

Let's take a look at HelloWorldController code and associated API spec first, then we examine what they do.

```js
import {api, inject} from '@loopback/core';
import {apiSpec} from './hello-world.api';

@api(apiSpec)
export class HelloWorldController {
  @inject('defaultName');
  private name: string;
  constructor() {}

  helloWorld(name?: string) {
      name = name || this.name;
      return `Hello world ${name}!`
  }
}

```
```js
// hello-world.api.ts
export const apiSpec =
{
  "paths": {
    "/helloworld": {
      "get": {
        "x-operation-name": "helloWorld",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "description": "Your name.",
            "required": false,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "Returns a hello world with your (optional) name."
          }
        }
      }
    }
  }
}
```
`@api` is a [class decorator](https://www.typescriptlang.org/docs/handbook/decorators.html).  The class decorator,
`api` is a function that is called when the class, HelloWorldController is defined (only once).  In this case, `api` function attaches the API specification to HelloWorldController class.  The decorator website describes some relatively complex concept, but we can just read the class decorator section to get a high-level understanding of decorator.  The concept is similar for other types of decorators.  That's enough for now.

In the above sample code, `@inject` is a `property decorator` defined by LoopBack Next.  It's a very important LoopBack Next concept.  It works this way: `@inject` acquires the value bound to the key: `defaultName` in the application's context, then assigns the value to `name` property when the class `HelloWorldControlle` is instantiated.

Please note that we introduced another new term, `Context`.  Context is simply a memory space where LoopBack Next maintains key-value pairs.  There are two types of context: application context and request context.  In this blog, we deal with only application context.

The LoopBack Next specific decorator, `@inject` can also be used as a `parameter decorator` for constructor, e.g.:
```js
class MyClass {
  constructor(
    @inject('defaultName') name: string
  } {}
}
```
In this case, the argument `name` is replaced with the value bound to the key `defaultName`.  `@inject` acquires the value bound to the `defaultName` key in the application's context, then assigns the value to `name` argument when the MyClass is instantiated.

Who binds `defaultName` key to the value?  It depends.  You can do that by app.bind(`defaultName`).to('Ted Johnson').  You can `get` the value string by app.getSync('defaultName').  The main usage of `@inject` is discussed in `Components and Providers` section.

### Components and Providers

Component defines a functionality.  LoopBack Next application can be viewed as a collection of components.  In a component, one or more providers implement the functionality.  In the Logger provider example below, (a) 'logger' key is  bound to the provider instance when Application is instantiated, and (b) the client is acquiring the logger instance by `app.get('logger')` and using the logger to display the message, 'My application has started.'.  Please also note that another component, `AuthenticationComponent` is attached to the application.

Let's take a close look at `LoggerComponent` implementation.  Please note that the key `logger` is bound to the logger instance.  With the binding, the client can access the logger instance by `app.get('logger')`. 

Client:
```js
const app = new Application({
  components: [AuthenticationComponent, LoggerComponent],
});

const logger = await app.get('logger');
logger.info('My application has started.');

```

Implementor:
```js
import {Component} from '@loopback/core';
const key = 'logger';

export class LoggerComponent implements Component {
  providers = {
    [key]: LoggerProvider,  // [key] is a computed property name
  }
}
```
  Note: What's computed property name ?  See http://es6-features.org/#ComputedPropertyNames
```js
import {Provider} from '@loopback/context';

export class LoggerProvider implements Provider<Logger> {

  ... logger implementation comes here.

}
```

### Custom Sequence

Controllers implement end points and business logic for each end point of the application.   Sequence defines the functional structure of the application.  There can be many end points associated with the application.  There is only one sequence per application.

Usually, the default sequence implemented by LoopBack Next core works for many applications.  In such a case, there is nothing the application needs to do.  However, to add a piece of new functional element to the application, you will implement the entire sequence in your application.  Here is how it works:

Client:
```js
const app = new Application();
app.sequence(MySequence);

```
Below is an example implementation of sequence.  We've studied `@inject` as a parameter decorator.  The four `sequence.actions` keys are bound to the corresponding essential sequence actions.  Since the essential sequence actions are implemented by LoopBack Next, you can simply inject them in your custom sequence as shown below.

The custom sequence below is defined to do something special with req and res objects.  That's the sole purpose of MySequence.
```js
import {DefaultSequence, FindRoute, InvokeMethod, Reject, Send, inject} from '@loopback/core';

class MySequence extends DefaultSequence {
  constructor(
    @inject('sequence.actions.findRoute') protected findRoute: FindRoute,
    @inject('sequence.actions.invokeMethod') protected invoke: InvokeMethod,
    @inject('sequence.actions.send') public send: Send,
    @inject('sequence.actions.reject') public reject: Reject,
  ) {
    super(findRoute, invoke, send, reject);
  }

  async handle(req: ParsedRequest, res: http.ServerResponse) {

    ... we can grab req and res and do something here.  This is the purpose
    ... of MySequence.

    await super.handle(req, res);
  }
}

```


____________________________________________
# Bonus

### How to test/validate API spec

As we saw in early part of this blog, the API spec is attached to the application controller.
Once attached, the loaded API spec can be accessed by `app.getApiSpec()`.

LoopBack Next provides the OpewnAPI spec validator, `validateApiSpec` as part of LoopBack Next lestlab.

```js
const validateApiSpec = require('@loopback/testlab').validateApiSpec;

describe('Application\'s Api Spec', () => {
  let app, apiSpec;
  before(() => { // executed once before any tests
    app = createApp();
    apiSpec = app.getApiSpec();
  });

  it('is valid', async () => {
    await validateApiSpec(apiSpec);
  });
});

```

### How to debug API spec

[The Swagger Editor](https://editor.swagger.io) is useful to interactively debug your OpenAPI specs.
You can start with JSON or YAML.  Just cut and paste the helloworld API spec (below) into the swagger editor window.  It will ask you to use JSON or covert it to YAML and build the API spec in YAML.
```js
{
  "swagger": "2.0",
  "basePath": "/",
  "info": {
    "title": "LoopBack Application",
    "version": "1.0.0",
  },
  "paths": {
    "/helloworld": {
      "get": {
        "x-operation-name": "helloWorld",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "description": "Your name.",
            "required": false,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "Returns a hello world with your (optional) name."
          }
        }
      }
    }
  }
}
```

### LoopBack Next globalization, eh?

[ECMAScript 6: Overview & Comparison](http://es6-features.org/#Collation) section mentions the 4 basic topics: collation, number, currency, and data/time formatting.

For string translation, the existing [strong-globalize](https://github.com/strongloop/strong-globalize) works beautifully as it does for LoopBack v2/v3.  In short, the code globalization is done in the TypeScript source files.  Once transpiled with `tsc`, run `slt-globalize` commands as usual.  The string-extraction is done from the *.JS files.

It shouldn't be non-trivial for `strong-globalize` to run the string-extraction directly from *.TS files either.  Let's leave it there for now.

Sample code: https://github.com/strongloop/ts-globalize
