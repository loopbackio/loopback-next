# @loopback/example-passport-login

A tutorial for implementing authentication in LoopBack 4 using
[passport](https://github.com/jaredhanson/passport) modules.

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Install](#install-the-example-locally)
- [Tutorial - Facebook](#Try-it-out-with-FaceBook)
- [Tutorial - Google](#Try-it-out-with-Google)

## Overview

This example demonstrates how to use the LoopBack 4 features (like
`@authenticate` decorator, strategy providers, etc) with
[passport strategies](http://passportjs.org). It includes the OAuth2 strategies
to interact with external OAuth providers like Facebook, Google, etc as well as
local and basic strategies.

You can use this example to see how to,

- Log in or Sign up into a LoopBack App using passport strategy modules
- Log in via external apps like Facebook or link those external profiles with a
  LoopBack user (for example, a LoopBack user can have associated
  Facebook/Google accounts to retrieve pictures).
- Use basic or local passport strategy modules

## Prerequisites

Before starting this tutorial, make sure you have Client-ids/Secrets from third
party apps

- [Facebook](https://developers.facebook.com/apps)
- [Google](https://console.developers.google.com/project)
- [twitter](https://apps.twitter.com/) **Not yet implemented**

## Authentication using passport strategies as Express middleware

Take a look at how to use passport strategies
[as Express middleware using interceptors](src/authentication-interceptors)

## Authentication using passport strategies as a step in Application Sequence

Take a look at how to use passport strategies
[by invoking independent of Express](src/authentication-strategies)

## Install the example locally

1. Run the `lb4 example` command to install `example-passport-login` repository:

   ```sh
   lb4 example passport-login
   ```

2. change into directory and then install the required dependencies:

   ```sh
   cd loopback4-example-passport-login && npm i
   ```

## Run the application

By default the user data is stored using a memory connector and saved locally to
`data/db.json`

Start the application with

```sh
$ npm start
```

To use Google or Facebook logins, you'll need:

- Copy `oauth2-providers.template.json` from this example project's root to
  `oauth2-providers.json`.
- Update Google/Facebook configuration in the json file.
- Set `OAUTH_PROVIDERS_LOCATION` environment variable to
  `../oauth2-providers.json`.

## Test the login scenarios

Open browser to http://localhost:3000

### Scenario 1 : Sign up as a local user

1. Click on `Sign Up` from the header menu and register as a local user.
2. If the email provided during registration, matches with your account in
   Facebook or Google you can link those profiles with your local account.
3. Click on `Login` from the header menu and enter registered email id and
   password. The `View account` page loads with user information.

### Scenario 2 : Link external profiles with a local user

1. Click on `Login` from the header menu, You will see various buttons under
   `Other login options`.
   - [Facebook](#Try-it-out-with-FaceBook)
   - [Google](#Try-it-out-with-Google)
   - `Twitter` - not yet implemented
2. When you click on any login option, the page is redirected to that social
   app's login page. On successful login with the social app, the `View account`
   page is loaded.
3. If the email-id registered in the social media app matches with a email-id
   registered locally, then the profiles will be linked and the `View account`
   page will display all the `linked accounts` for that locally registered user.
4. Click on Logout to log out of user session

### Scenario 3 : Sign up via an external Social Media app

1. Click on `Login` from the header menu, You will see various buttons under
   `Other login options`.
   - [Facebook](#Try-it-out-with-FaceBook)
   - [Google](#Try-it-out-with-Google)
   - `Twitter` - not yet implemented
2. When you click on any login option, the page is redirected to that social
   app's login page. On successful login with the social app, the `View account`
   page is loaded.
3. If the email-id registered in the social media app does not match any
   email-ids registered locally, then a new user is signed up. `View account`
   page will display the external profile used to login under the
   `linked accounts` section.
4. Click on Logout to log out of user session

## Try it out with FaceBook

### Create a test app and test user in FaceBook

1. Login to Facebook developer console: https://developers.facebook.com/apps
2. Click on `My Apps` tab in the dashboard menu, and then select `Add a new App`
3. This loads the `App creation` page. Pick the platform as `Website` and then
   enter app category, app name and "Site URL" (Skip the quick start)
4. Click `Settings` tab from the left hand side navigation menu, note the "App
   ID" and "App Secret" and save
5. Click the `Roles` tab from the left hand side navigation menu, then the
   `Test users` link under it, to display a list of test users. You can also
   create a new test user.
6. On any listed test user, click the edit button to open an actions menu ->
   click `Change permissions granted by this test user` and add [`email`,
   `manage_pages`] scopes to permissions

- NOTE:
  - Your app may not work if the settings are missing a contact email and/or
    "Site URL".
  - if you are testing locally, you can simply use `localhost:[port#]` as your
    "Site URL".

### Create oauth2-providers.json

- Copy `oauth2-providers.template.json` from this example project's root to
  `oauth2-providers.json`
- Update Facebook oauth2 config with the values for `clientID/clientSecret` from
  your test app.

  ```json
  "facebook-login": {
    "provider": "facebook",
    "module": "passport-facebook",
    "clientID": "xxxxxxxxxxxxxxx",
    "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "callbackURL": "/auth/facebook/callback",
    "authPath": "/auth/facebook",
    "callbackPath": "/auth/facebook/callback",
    "successRedirect": "/auth/account",
    "failureRedirect": "/login",
    "scope": ["email"],
    "failureFlash": true,
    "profileFields": ["gender", "link", "locale", "name", "timezone", "verified", "email", "updated_time"]
  }
  ```

The `profileFields` field above tells Facebook details to return in profile data
after authentication. For more information regarding the providers template, see
http://loopback.io/doc/en/lb2/Configuring-providers.json.html.

### Log in with Facebook

- Open your browser to the example app with `http://localhost:3000`
- Click `Log In` from the example app header menu
- Click on `Log In with Facebook` button
- FaceBook login page opens, enter test user-id and password
- example app loads again on successful login
- redirect to example app will fail if Facebook did not return profile with
  email-id

## Try it out with Google

### Create test credentials in Google

1. Login to Google developer console: https://console.developers.google.com You
   may have to create a sample project if you are new to Google developer
   console
2. Click on `OAuth consent screen` from the left hand side navigation menu,
   select `External`, click `Create` button
3. This loads the `Application` page to register your app. Enter app name and
   check if scopes has `email` permission
4. Click on `Credentials` link in the left hand side navigation menu
5. Then click `Create Credentials` tab, and select `OAuth Client ID`
6. This loads the `Create Client ID` page. Select application type as
   `web application`, enter name and click `Create` button
7. A pop up loads with the created credentials. Note the displayed "Client ID"
   and "Client Secret" and save

### Create oauth2-providers.json

- Copy `oauth2-providers.template.json` from this example project's root to
  `oauth2-providers.json`
- Update Google oauth2 config with the values for `clientID/clientSecret` from
  your Google test app.

  ```json
  "google-login": {
      "provider": "google",
      "module": "passport-google-oauth2",
      "strategy": "OAuth2Strategy",
      "clientID": "{google-client-id}",
      "clientSecret": "{google-client-secret}",
      "callbackURL": "/api/auth/thirdparty/google/callback",
      "authPath": "/api/auth/thirdparty/google",
      "callbackPath": "/api/auth/thirdparty/google/callback",
      "successRedirect": "/auth/account",
      "failureRedirect": "/login",
      "scope": ["email", "profile"],
      "failureFlash": true
  }
  ```

### Log in with Google

- Open your browser to the example app with, `http://localhost:3000`
- Click on `Log In` from the example app header menu
- Click on `Log In with Google` button
- Google login page opens, enter Google user-id and password
- example app loads again on successful login
