# Feature: Bootstrapping the Application


## Scenario: Basic Application

- Given a `Application`
- When I make a get the `Application` status
- Then the `Application` 

```ts
import {Application} from "loopback";

let app = new Application();

app.status(); // => {state: AppState.COLD}
let start = app.start();
app.status(); // => {state: AppState.STARTING}
await start;
app.status(); // => {state: AppState.RUNNING}
```


## Scenario: Application with Server

- Given a `Application`
- And a `Server` bound to the `Application`
- When I get the `Application` status
- Then the `Application` responds with the correct `AppState`

```ts
import {Application, Server} from "loopback";

let app = new Application();
let server = new Server();

app.bind('server').toConstantValue(server);

app.status(); // => {state: AppState.COLD}
let start = app.start();
app.status(); // => {state: AppState.STARTING}
await start;
app.status(); // => {state: AppState.RUNNING, server: {port: 3000}}
```


## Scenario: Stopping an Application

- Given a `Application` in the `RUNNING` state
- And a listening `Server` bound to the `Application`
- When I stop the `Application`
- And I get the `Application` state
- Then the `Application` responds with the `STOPPED` state
- And the `Server` is no longer listening
- And the `Server` port is undefined

```ts
// app already started
app.status(); // => {state: AppState.RUNNING, server: {port: 3000}}
await app.stop();
app.status(); // => {state: AppState.STOPPED, server: {listening: false}}
```
