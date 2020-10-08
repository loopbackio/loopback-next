# @loopback/websocket

This module allows integrating [socket.io](http://socket.io) to handle
connections in a friendly way through drivers.

## Stability: ⚠️Experimental⚠️

> Experimental packages provide early access to advanced or experimental
> functionality to get community feedback. Such modules are published to npm
> using `0.x.y` versions. Their APIs and functionality may be subject to
> breaking changes in future releases.

## Installation

```sh
npm install --save https://github.com/arondn2/loopback4-extension-websocket
```

## Example
https://github.com/arondn2/loopback4-example-websocket

## How to use

### Instancing the application

#### With Basic WebsocketApplication
Extends the application of `WebsocketApplication` class which has everything
need it.
```typescript
import { WebsocketApplication } from '@loopback/websocket';

export class MyApplication extends WebsocketApplication {
}
```

#### With Basic Loopback 4 Application
Load de component in the application constructor then get websocket server
instance with `WebsocketBindings.SERVER` binding. Also, overwrite `start` and
`stop` methods to start and stop websocket server.

```typescript
import { Application, ApplicationConfig } from '@loopback/core';
import { WebsocketServer, WebsocketBindings } from '@loopback/websocket';

export class MyApplication extends Application {
  // Property for ws server
  public readonly wsServer: WebsocketServer;
  constructor(options: ApplicationConfig = {}) {
    super(options);
    
    // Load ws component
    this.component(WebsocketComponent);
    
    // Instance ws server
    this.wsServer = this.getSync(WebsocketBindings.SERVER);
  }
  
  // Start ws server
  async start() {
    await this.wsServer.start();
  }
  // Stop ws server
  async stop() {
    await this.wsServer.stop();
  }
}
```

#### Use a existing request handler

When is needed attach websocket server to existing request handler
like `RestApplication` or `express`, is necessary overwrite
`WebsocketBindings.REQUEST_HANDLER` after load the component
and before instancing websocket server in the application
constructor.

With an express instance:
```typescript
import { WebsocketBindings, WebsocketComponent } from '@loopback/websocket';

...

this.component(WebsocketComponent);

const expressApp = express();
this.bind(WebsocketBindings.REQUEST_LISTENER).to(expressApp);

this.wsServer = this.getSync(WebsocketBindings.SERVER);
```

With a RestApplication application
```typescript
import { WebsocketBindings, WebsocketComponent } from '@loopback/websocket';

...

this.component(WebsocketComponent);
// this.requestHandler is a property of RestApplication
this.bind(WebsocketBindings.REQUEST_LISTENER).to(this.requestHandler);

this.wsServer = this.getSync(WebsocketBindings.SERVER);
```

#### Configuration
The configuration for the `WebsocketServer` can by send via options of
the application constructor
```typescript
const app = new MyApplication({
  websocket: {
    host: '127.0.0.1',
    port: 0,
  },
});
```

### Register controllers

To register a controller use `route` method of `WebsocketServer` instance.
```typescript
export class ChatController {}

...

// To root namespace
this.wsServer.route(ChatController);
// To specific namespace
this.wsServer.route(ChatController, '/ws/chat');
this.wsServer.route(ChatController, /^\/ws\/chat$/);
```

Controller can be decorator with `@ws.controller()` to specify the namespace
to handle.
```typescript
import { ws } from '@loopback/websocket';

@ws.controller('/ws/chat')
export class ChatController {}

...

this.wsServer.route(ChatController);
```

### Subscribe method to events
To subscribe a controller's method to an event use decorators: 

```typescript
import { ws } from '@loopback/websocket';

export class ChatController {
  // Subscribe to connection
  @ws.connect()
  connect() {}
  
  // Subscribe to event by string
  @ws.subscribe('chat message')
  handleChatMessage() {}

  // Subscribe to event by regex
  @ws.subscribe(/.+/)
  logMessage() {}

  // Subscribe to disconnection
  @ws.disconnect()
  disconnect() {}
}
```

### Injection of elements
Different objects can be injected into controller's methods subscribed to event
of socket.

#### Inject connection socket
Socket can be injected in methods decorated with `@ws.connect`, `@ws.subscribe` or
`@ws.disconnect`. Also, you can inject it in the controller constructor.
```typescript
import { Socket } from 'socket.io';
import { ws } from '@loopback/websocket';

export class ChatController {
  constructor(@ws.socket() socket: Socket){
    console.log('controller instance created for: %s', socket.id);
  }
  @ws.connect()
  connect(@ws.socket() socket: Socket) {
    console.log('Client connected: %s', socket.id);
  }

  @ws.subscribe('chat message')
  handleChatMessage(msg: unknown, @ws.socket() socket: Socket) {
    console.log('Chat message: %s', msg);
    socket.nsp.emit('chat message', `[${socket.id}] ${msg}`);
  }

  @ws.disconnect()
  disconnect(@ws.socket() socket: Socket) {
    console.log('Client disconnected: %s', socket.id);
  }
}
```

#### Inject IO Server instance
```typescript
import { Server } from 'socket.io';
import { ws } from '@loopback/websocket';

export class ChatController {
  
  @ws.subscribe('chat message')
  handleChatMessage(msg: unknown, @ws.io() io: Server) {
    console.log('Chat message: %s', msg);
    io.emit('chat message', `${msg}`);
  }
  
}
```

#### Inject namespace instance
The namespace are bind in the context if a name is specified. The name of the
namespace can be set in `@ws.controller` decorator or in `route` method of
`WebsocketServer` instance.
```typescript
import { Namespace } from 'socket.io';
import { ws } from '@loopback/websocket';

// Specify a name for the namespace by decorator
@ws.controller({ name: 'chatNsp', namespace: '/ws/chat' })
export class ChatController {
  
  @ws.subscribe('chat message')
  handleChatMessage(
    msg: unknown,
    // Specify the name of the namespace to inject
    @ws.namespace('chatNsp') nsp: Namespace
  ) {
    console.log('Chat message: %s', msg);
    nsp.emit('chat message', `${msg}`);
  }
  
}

...
// Specify a name for the namespace by route method
this.wsServer.route(ChatController, { name: 'chatNsp', namespace: '/ws/chat' });
```

> Each connection will create an instance of the controller which will handle
> events until it disconnect.

### Response of events
When a client sends an event to the server, it can wait a response. The server
sends to the client the returned value of the method invocation with a default
format: If the method is invoked successfully the response format is `{ result:
<RETURNED_VALUE> }`. If the method invoked fail the response format is `{ error:
<ERROR> }`
Server
```typescript
import { Namespace } from 'socket.io';
import { ws } from '@loopback/websocket';

@ws.controller('/ws/chat')
export class ChatController {
  
  @ws.subscribe('chat message')
  handleChatMessage(
    msg: unknown,
    @ws.socket() socket: Socket
  ) {
    if (msg === '') {
      throw new Error('msg is empty');
      socket.emit('new message', `new message: ${msg}`)
    }
    return { text: msg };
  }
  
}
```
Client
```javascript
var socket = io('/ws/chat');

socket.emit('chat message', 'my message', function (response) {
  // prints { result: { text: 'my message' } }
  console.log(response);
});

socket.emit('chat message', '', function (response) {
  // prints { error: { message: 'msg is empty' } }
  console.log(response);
});

socket.on('msg is empty', function (response) {
  // prints 'new message: my message'
  console.log(response)
});
```

### Custom send response of the event
To change the way of send the response of the client emit, the bindings
`WebsocketBindings.SEND_METHOD` and `WebsocketBindings.REJECT_METHOD` can be
overwritten. Even the method that invoke the controller method can be change
through `WebsocketBindings.INVOKE_METHOD`.

Server:
```typescript
import { invokeMethod } from '@loopback/context';
import { WebsocketBindings } from '@loopback/websocket';

// Change the way send the response
this
  .bind(WebsocketBindings.SEND_METHOD)
  .to((done, result) => {
    done({ myResult: result }); // default: done({ result });
  });

// Change the way reejct the response
this
  .bind(WebsocketBindings.REJECT_METHOD)
  .to((done, error) => {
    done({ myError: error }); // default: done({ error });
  });

// Change the way send invoque the method
this
  .bind(WebsocketBindings.INVOKE_METHOD)
  .to(async (context, controller, methodName, args) => {
    // Default: return invokeMethod(controller, methodName, context, args);
    const result = await invokeMethod(controller, methodName, context, args);
    return { invokeResult: result };
  });
```

Client:
```javascript
var socket = io('/ws/chat');
socket.emit('chat message', '', function (response) {
  // if event success respone = { myResult: { invokeResult: METHOD_RESULT } }
  // if event fail respone = { myError: ERROR }
});
```

### Sequence to handler events
The process to invoke, send and reject events is controller by a `WebsocketSequence`
implementation, which can be overwritten binding
```typescript
import { Context, ControllerClass, CoreBindings, inject } from '@loopback/core';

import {
  WebsocketInvokeMethod,
  WebsocketRejectMethod,
  WebsocketSendMethod,
  WebsocketSequence,
  WebsocketBindings,
} from '@loopback/websocket';

export class CustomWebsocketSequence implements WebsocketSequence {
  constructor(
    @inject.context() protected context: Context,
    @inject(CoreBindings.CONTROLLER_CURRENT) protected controller: ControllerClass,
    @inject(WebsocketBindings.INVOKE_METHOD) protected invoke: WebsocketInvokeMethod,
    @inject(WebsocketBindings.SEND_METHOD) protected send: WebsocketSendMethod,
    @inject(WebsocketBindings.REJECT_METHOD) protected reject: WebsocketRejectMethod
  ) {}

  async handle(methodName: string, args: unknown[], done: Function) {
    console.log('handle controller method', methodName, args);
    try {
      const result = await this.invoke(
        this.context,
        this.controller,
        methodName,
        args
      );
      await this.send(done, result);
    } catch (err) {
      await this.reject(done, err);
    }
  }
}

...
// Binding the sequence class
this.bind(WebsocketBindings.SEQUENCE).toClass(CustomWebsocketSequence);
```

### Booter of controllers
The controllers can be and loaded and routed automatically through
application options `websocketControllers`:
```typescript
import { BootMixin } from '@loopback/boot';
import { Application, ApplicationConfig } from '@loopback/core';
import { WebsocketServer, WebsocketBindings } from '@loopback/websocket';

export class MyApplication extends BootMixin(WebsocketApplication) {
  // ...
}
// OR
export class MyApplication extends BootMixin(Application) {
  // ...
}

const app = new MyApplication({
  websocket: {
    host: '127.0.0.1',
    port: 0,
  },
  // Default values
  websocketControllers: {
    dirs: ['ws-controllers'],
    extensions: ['.controller.js'],
    nested: true,
  }
});
```

## References
- https://github.com/raymondfeng/loopback4-example-websocket/
- https://github.com/strongloop/loopback-next/tree/socketio/extensions/socketio 

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
