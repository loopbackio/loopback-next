# Feature: Authentication

- In order to add security to my app
- As an app developer
- I want the extension to authenticate requests
- So that I can determine who is allowed to do what with my app

## Scenario: Basic Usage

```ts
import {BasicStrategy} from 'passport-http';
let app = new Application();
let server = new Server();
let client = new Client(server.url);

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
  @app.authenticate
  public whoAmI(@app.inject('authentication.user') user) : string {
    if(!user) 'please login...';
    return user.username;
  }
}

app.controller(MyController);
server.bind('applications.myApp').to(app);

app.bind('authentication.verifyPassword').to(() => {
  return function(storedPassword, providedPassword) {
    // unecrypted password example:
    return storedPassword === providedPassword;
  }
});
app.bind('authentication.strategy').to(BasicStrategy);
app.bind('authentication.user').to(() => {
  const ctx = this;
  const verifyPassword = ctx.get('authentication.verifyPassword');
  const user = await User.findOne({ username: userid });
  if(!verifyPassword(user.password, password)) return false;
  return user;
});

await server.start();
await client.get('/echo?msg=hello%20world'); // => {status: 200, body: 'hello world'}
```
