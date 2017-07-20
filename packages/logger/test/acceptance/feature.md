# Feature: Logging

- In order to add logging to my app
- As an app developer
- I want the component to enable logging functionality at app instantiation
- So that I can monitor various states of my app

## Scenario: Basic Usage
## To be implemented

```ts
////////// acceptance
import {BasicStrategy} from 'passport-http';
import {logger} from '@loopback/logging';
const app = new Application();

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
    assert(user);
    return user.username;
  }
}

app.controller(MyController);
server.bind('applications.myApp').to(app);

function verifyPassword(storedPassword, providedPassword) {
  // unecrypted password example:
  return storedPassword === providedPassword;
}

const USERS = {
  joe: {username: 'joe', password: '12345'}
};

// my get user function
 app.bind('authentication.strategy').to(() => {
    return new BasicStrategy(verify);

    function verify(username, password, cb) {
      cb(null, {username: username});
    }
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
