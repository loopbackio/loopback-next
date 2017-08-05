# LoopBack Next Programming

It was written to share my experience in early days of LoopBack Next core development.  It's more like a blog for LoopBack.Next development than readme of a component.

Detailed technical description of LoopBack.Next component development can be found on [the LoopBack.Next wiki](https://github.com/strongloop/loopback-next/wiki/Writing-Components).  [Authentication README](https://github.com/strongloop/loopback-next/tree/master/packages/authentication) is also a great stuff to study when integrating the Authentication component to your application.



# Introduction

Target audience of this blog is new LoopBack.Next developers who have done LoopBack application development in the following environment:

- Nodejs v4, v6, or v8
- Using JavaScript, more precisely [ECMAScript 5](https://en.wikipedia.org/wiki/ECMAScript#5th_Edition),
  which means that no clear pattern of object oriented programming such as `class`, `implements` (abstract class), and 'extends' (inheritance).  Used [util.inherits](https://nodejs.org/docs/latest/api/util.html#util_util_inherits_constructor_superconstructor) everywhere.
- Not using [TypeScript](https://www.typescriptlang.org/)

When I started to look around LoopBack.Next code base, I quickly got confused.  A couple of examples among many others:

First, the LoopBack.Next source code does not look like JavaScript.  For example,

- What are the [square brackets](http://es6-features.org/#ComputedPropertyNames) around object property name?
```
var obj = {
  [key]: 'Ted Johnson',
}
```
- I see how [the class](http://es6-features.org/#ClassDefinition) is defined.  My source code editor (such as [VS Code](https://code.visualstudio.com/) shows mouse-over pop-ups, which is super cool, but what's that [@inject](https://www.typescriptlang.org/docs/handbook/decorators.html)?
```
export class MyProvider implements Provider<Strategy> {
  constructor(
    @inject(bindingKey)
    metadata: Metadata,
  ) {}

  value() : ValueOrPromise<Strategy> {}
}
```

Secondly, there are several new technologies we use in LoopBack Next and each of them is significantly different from what I got used to.  Mentioned [ECMAScript 6](https://en.wikipedia.org/wiki/ECMAScript#6th_Edition_-_ECMAScript_2015) and [TypeScript](https://www.typescriptlang.org/) above; and [OpenAPI](https://www.openapis.org/) is another.  They are cool new technologies that make LoopBack Next really shining, but I felt being pulled out of my comfort zone many times a day.

This blog will cover two major areas: Foundation and LoopBack Next programming.  I wanted to use half of the page space on the foundation technologies because "divide and conquer" is the right strategy here, i.e., start from the most basic stuff that has much less dependencies and build the next on top of it.  At the same time, we need to keep the clear goal in mind, i.e., LoopBack Next programming so that we can selectively study topics in the foundation technologies, move on to LoopBack Next space, then come back to the foundation when needed.

In LoopBack Next topics, our focus is these three core concepts: controllers, components, and sequence.

Alright, let's get the foundation techniques under the belt.



# Foundation

Here, I'm going to summarize a few key concepts and a list of tools I've found very useful.  With that, I got a big picture without getting bogged down to the details of each technology; and, at the same time, learned a way to go back the the details when needed.

LoopBack Next is built on TypeScript and OpenAPI.  TypeScript is build on ECMAScript 6.  Quickly browsing those technologies from the ground up help solidify our steps. 

### [ECMAScript 6](https://en.wikipedia.org/wiki/ECMAScript#6th_Edition_-_ECMAScript_2015)

1. ECMAScript 6 — New Features: Overview & Comparison -- http://es6-features.org/#Constants 
2. The spec -- https://www.ecma-international.org/ecma-262/6.0/ECMA-262.pdf
3. Arrow Functions -- http://es6-features.org/#ExpressionBodies

The overview & comparison site is very helpful to me.  Reading through the short list of code comparison between ES5 and ES6 gave me a good perspective.  I frequently go back to the site.  When I wanted to understand what's not there, I went to the spec and other options, but that rarely occurred.

### [TypeScript](https://www.typescriptlang.org/) : Type System on ECMAScript 6

1. Getting Started With TypeScript -- https://basarat.gitbooks.io/typescript/docs/getting-started.html 
2. Declaration Files -- https://basarat.gitbooks.io/typescript/docs/types/ambient/d.ts.html
3. Decorators -- https://www.typescriptlang.org/docs/handbook/decorators.html

When you need to `npm install async` don't forget to `npm install -S "@types/async"

### [OpenAPI](https://www.openapis.org/)

1. https://editor.swagger.io

Note (LoopBack Next specific): In a LoopBack Next app, typically you don't put the header portion of the api spec(see below) because LoopBack Next adds it when internalizing it.  The swagger editor will complain without the header portion.
```
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



# LoopBack Next

We're going to examine three key concepts: controller & apiSpec, components & providers, and custom sequence.  Working sample codes are available in several places, one of which is [Hello World](https://github.com/strongloop/loopback-next-hello-world).  I'm going to focus on specific conceptual roadblocks I stumbled on.

Skeleton of the client code looks like this:
```
  const app = new Application({
    components: [HisComponent],
   });
  app.controller(HelloWorldController);
  app.sequence(MySequence);
```

### Controllers and API Spec

Let's take a look at HelloWorldController code and associated API spec first, then we study what they do.

```
import {api inject} from '@loopback/core';
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
```
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
@api is a [class decorator](https://www.typescriptlang.org/docs/handbook/decorators.html).  The class decorator,
`api` is a function that is called when the class, HelloWorldController is instantiated.  In this case, `api` registers
the API specification to the application.  The decorator site describes some relatively complex concept, but we can just read the class decorator section to get a high-level understanding of decorator.  The concept is the same for other types of decorators.  That's enough.

In the above sample code, @inject is a property decorator defined by LoopBack Next.  It's a very important LoopBack Next concept.  It works this way: @inject acquires the value bound to the key: `defaultName` in the application's context, then assigns the value to `name` property when the class `HelloWorldControlle` is instantiated.

Please note that we introduced another new term, `Context`.  Context is simply a memory space where LoopBack Next maintains key-value pairs.  There are two types of context: application context and request context.  In this blog, we deal with only application context.

The LoopBack Next specific decorator, @inject can be used as a parameter decorator e.g.:
```
  helloWorld(@inject('defaultName') name: string) { ... }
```
In this case, the argument `name` is replaced with the value bound to the key `defaultName`.  @inject acquires the value bound to the `defaultName` key in the application's context, then assigns the value to `name` argument when the helloWorld method is invoked.

Who binds `defaultName` key to the value?  It depends.  You can do that by app.bind(`defaultName`).to('Ted Johnson').  You can `get` the value string by app.getSync('defaultName').

More important usage of @inject is discussed in `Component and Provider` section.

### Components and Providers

Component defines a functionality.  LoopBack Next application can be viewed as a collection of components.  In a component, one or more providers implement the functionality.  In the Logger provider example below, (a) 'logger' key is  bound to the provider instance when Application is instantiated, and (b) the client is acquiring the logger instance by app.getSync('logger') and using the logger to display the message, 'My application has started.'.

Client:
```
const app = new Application({
  components: [AuthenticationComponent, LoggerComponent],
});

const logger = app.getSync('logger');
logger.info('My application has started.');

```

Implementor:
```
import {Component} from '@loopback/core';
const key = 'logger';

export class LoggerComponent implements Component {
  providers = {
    [key]: LoggerProvider,  // [key] is a computed property name
  }
}
```
  Note: What's computed property name ?  See http://es6-features.org/#ComputedPropertyNames
```
import {Provider} from '@loopback/context';

export class LoggerProvider implements Provider<SimpleLogger> {

  ... logger implementation comes here.

}
```

### Custom Sequence

Controllers implement end points and business logic for each end point of the application.   Sequence defines the functional structure of the application.  There can be many end points associated with the application.  There is only one sequence per application.

Usually, the default sequence implemented by LoopBack Next core works for many applications.  In those cases, there is nothing the application needs to do.  To add a piece of new functional element to your application, you will implement the entire sequence in your application.

Client:
```
const app = new Application({
  components: [AuthenticationComponent, LoggerComponent],
});
app.sequence(MySequence);

const logger = app.getSync('logger');
logger.info('My application has started.');

```
Below is an example implementation of sequence.  We've studied @inject as a parameter decorator.  The four `sequence.actions` keys are bound to the corresponding essential sequence actions.  Since each of the essential sequence actions are implemented by LoopBack Next and in most cases, you can simply inject them in your custom sequence.

The custom sequence below is defined to do something special with req and res objects.  That's the sole purpose of MySequence.
```
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
    ... of implementing MySequence.

    await super.handle(req, res);
  }
}

```


# Bonus

### How to test/validate API Spec

As we saw in early part of this blog, the API Spec is attached to the application controller.
Once attached, the loaded API spec can be accessed by `app.getApiSpec()`

LoopBack Next provides the OpewnAPI spec validator, validateApiSpec as part of the lestlab.

```
const validateApiSpec = require('@loopback/testlab').validateApiSpec;

describe('validate Api Spec', () => {
  let app = createApp(); // instantiates the app, its controllers, and the API spec.
  let apiSpec = app.getApiSpec();

  it('apiSpec is valid', async () => {
    await validateApiSpec(apiSpec);
  });
});

```

### How to debugt API Spec

[The Swagger Editor](https://editor.swagger.io) is useful to interactively debug your OpenAPI specs.
You can start with JSON or YAML.  Just cut and paste the helloworld API spec (below) into the swagger editor window.  It will ask you to use JSON or covert it to YAML and build the API spec in YAML.
```
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

### LoopBack Next globalization, heh?

[ECMAScript 6: Overview & Comparison](http://es6-features.org/#Collation) section mentions the 4 basic topics: collation, number, currency, and data/time formatting.

For string translation, the existing [strong-globalize](https://github.com/strongloop/strong-globalize) works beautifully as it does for LoopBack v2/v3.  In short, the code changes is done in the TypeScript source files.  Once transpiled with `tsc`, run `slt-globalize` commands as usual.  The string-extraction is done from the *.JS files.

Sample code: https://github.com/strongloop/ts-globalize
