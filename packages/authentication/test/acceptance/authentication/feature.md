# Feature: Authentication

- In order to add security to my app
- As an app developer
- I want the extension to authenticate requests
- So that I can determine who is allowed to do what with my app

## Scenario: Basic Usage

```ts
import {BasicStrategy} from 'passport-http';
import {authenticate, UserInfo} from '@loopback/authentication';
const app = new Application();
const server = new Server();
const client = new Client(server.url);

@api({
  basePath: '/',
  paths: {
    '/who-am-i': {
      get: {
        'x-operation-name': 'whoAmI',
        responses: {
          '200': {
            type: 'string'
          }
        }
      }
    }
  }
})
class MyController {
  constructor(public @inject('authentication.user') user : UserInfo) {

  }

  @authenticate
  public whoAmI() : string {
    const user = this.user;
    if(!user) return 'please login...';
    return user.username;
  }
}

app.controller(MyController);
server.bind('applications.myApp').to(app);

// tell loopback/authentication to use the BasicStrategy
app.bind('authentication.strategy').to(BasicStrategy);

function verifyPassword(storedPassword, providedPassword) {
  // unecrypted password example:
  return storedPassword === providedPassword;
}

const USERS = {
  joe: {username: 'joe', password: '12345'}
};

// my get user function
app.bind('authentication.user').to(() => {
  const ctx = this;
  const username = ctx.get('authentication.credentials.username');
  const password = ctx.get('authentication.credentials.password');
  const user = USERS[username];
  if (!user) return null;
  if (!verifyPassword(user.password, password)) return null;
  return user;
});

// test the app
await server.start();
await client
  .auth({
    username: 'joe',
    password: '123456'
  })
  .get('/who-am-i'); // => joe

await client
  .auth({
    username: 'joe',
    password: 'bad password'
  })
  .get('/who-am-i'); // => 401

await client
  // no auth
  .get('/who-am-i'); // => 401
```
