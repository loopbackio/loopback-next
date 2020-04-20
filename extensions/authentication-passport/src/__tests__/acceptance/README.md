# Acceptance tests

## OAuth2 passport strategy tests

- The test file
  `authentication-with-passport-strategy-oauth2-adapter.acceptance` consists of
  three main components:

  A. the Supertest client

  B. a LoopBack app (fixtures/simple-rest-app.ts) - has a simple app with no
  controller, Oauth2Controller is added during the test run

  C. Mock Authorization Server (fixtures/mock-oauth2-social-app.ts) - mocks the
  authorization flow login with a social app like facebook, google, etc

### Test steps:

```
  A. an Oauth2Controller is added to LB App : defines two endpoints `/auth/thirdparty` and `/auth/thirdparty/callback`
  B. start LB app and Mock Authorization Server
  C. Test stage 1 : Authorization code grant - Get access code
                    from below diagram check flows - [1, 2, 3, 4, 5]
                    [1] - test end point `/auth/thirdparty`
                    [2, 3] - test redirection to mock auth server login page
                    [4, 5] - test login with mock server redirects to callback url
  D. Test stage 2 : Authentication - Exchange access code for access token
                    from below diagram check flows - [6, 7, 8]
                    [5, 6] - test callback endpoint `/auth/thirdparty/callback`
                    [7, 8] - check if valid access token was fetched


  +------------+                                                              +--------------+
  |            |                                                              | LoopBack App |
  | web client |     -------------------[1]--------------------->             | (simple-rest |
  | (supertest)|     auth request to LB App on behalf of a user,              |  -app.ts)    |
  |            |     payload: {'client_id': , 'secret': }                     | ***          |
  |            |                                                              |  ^           |
  |            |              +---------------+                               |  |           |
  |            |              |               | <---------[2]-------------    |  |           |
  |            |              | Mock          | LB App redirects browser      |  |           |
  |            |              | Authorization | to auth server,payload:       |  |           |
  |            |              | Server        | {'client_id':,                |  |           |
  |            |              | (mock-oauth2- |     'callback_url': app url } |  Stage 1     |
  |            |              | social-app.ts)|                               |  |           |
  |            |              |               |----+ auth server redirects    |  |           |
  |            |              |               |    | browser to login page,   |  |           |
  |            |              |               |  [3] client_id and            |  |           |
  |            |              |               |    | callback_url are         |  |           |
  |            |              |               |<---+ passed as hidden params  |  |           |
  |            |              |               |                               |  |           |
  |            | -----[4]---> |               |                               |  v           |
  |            |   login with |               | -------[5]------------->      | ***          |
  |            |    user name |               | login success, auth server    |  ^           |
  |            |    /password |               | redirects browser to callback |  |           |
  |            |              |               | url with access_code          |  |           |
  |            |              |               |                               |  |           |
  |            |              |               | <-------------[6]---------    |  |           |
  |            |              |               |  LB app requests access token |  Stage 2     |
  |            |              |               |  with access_code             |  |           |
  |            |              |               |                               |  |           |
  |            |              |               | ---------------[7]--------->  |  |           |
  |            |              +---------------+       returns access token    |  |           |
  |            |                                                              |  v           |
  |            |      <------------------------[8]-----------------------     | ***          |
  +------------+        LB App returns to browser the access token            +--------------+
```
