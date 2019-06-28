---
lang: en
title: 'Deploying to IBM Cloud'
keywords: LoopBack
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Deploying-to-IBM-Cloud.html
---

This is a basic guide for deploying a LoopBack 4 (LB4) app to
[IBM Cloud](https://cloud.ibm.com/). In the setup explained below, your app will
use a provisioned
[Cloudant service](https://cloud.ibm.com/catalog/services/cloudant) when running
on the IBM Cloud.

**NOTE**: Production deployment to IBM Cloud is a much bigger topic with many
possible options, refer to
"[IBM Cloud Continuous Delivery: Build, deploy, and manage apps with toolchains](https://www.ibm.com/cloud/garage/content/deliver/tool_continuous_delivery/)"
for the details.

## Before we begin

Make sure you have:

- an account on IBM Cloud. If not, you can
  [sign up here](https://cloud.ibm.com/login).
- installed
  [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html)

## Preparing your application

We will be using the
["todo" example](https://github.com/strongloop/loopback-next/tree/master/examples/todo)
from the [loopback-next repository](https://github.com/strongloop/loopback-next)
as a basis for the instruction.

You can quickly clone the "todo" example app by running the command:

```sh
lb4 example todo
```

Then you can replace the default memory-based connector of the app with a
Cloudant connector, so data is persisted.

### Step 1: Provisioning a Cloudant database service

- Go to the
  [IBM Cloud Catalog](https://cloud.ibm.com/catalog?category=databases), select
  `Cloudant` under `All Categories` > `Databases`.
- Name your Cloudant service name as `myCloudant`. Keep the defaults for region
  and resource group. Select "Use both legacy credentials and IAM" as the
  available authentication methods

  ![myCloudant service name](../imgs/deploytocloud-mycloudant.png)

- Click Create.

### Step 2: Creating a database named `todo`.

- Go to your [IBM Cloud dashboard](https://console.bluemix.net/dashboard/apps).
- Click on `myCloudant` under `Services`.
- Click `Launch Cloudant Dashboard`.
  ![launch cloudant dashboard](../imgs/deploytocloud-launchcdashboard.png)

- In the Cloudant dashboard, click `Create Database` at the top of the page and
  name it as `todo`.

  ![create database](../imgs/deploytocloud-createdb.png)

### Step 3: Updating your DataSource

Update `db.datasource.json` to use the Cloudant connector. The value for the
`url` property is just a placeholder and does not need to have the correct
credential because we will be binding the app with the Cloudant service once
it's pushed to IBM Cloud.

```js
{
  "name": "db",
  "connector": "cloudant",
  "url": "http://admin:pass@localhost:8080",
  "database": "todo",
  "modelIndex": ""
}
```

Install the `loopback-connector-cloudant` package.

```sh
$ npm i loopback-connector-cloudant
```

### Step 4: Updating the application

1. We will use the `cfenv` module to simplify some of the Cloud Foundry related
   operations. Install `cfenv` in the project directory.

   ```sh
   $ npm i cfenv
   ```

2. Update the `src/index.ts` file to the following to enable service binding.
   Add the 3 snippets as indicated below:

   ```ts
   import {TodoListApplication} from './application';
   import {ApplicationConfig} from '@loopback/core';
   // --------- ADD THIS SNIPPET ---------
   const datasourceDb = require('./datasources/db.datasource.json');
   const cfenv = require('cfenv');
   const appEnv = cfenv.getAppEnv();
   // --------- ADD THIS SNIPPET ---------

   export async function main(options?: ApplicationConfig) {
     // --------- ADD THIS SNIPPET ---------
     // Set the port assined for the app
     if (!options) options = {};
     if (!options.rest) options.rest = {};
     options.rest.port = appEnv.isLocal ? options.rest.port : appEnv.port;
     options.rest.host = appEnv.isLocal ? options.rest.host : appEnv.host;
     // --------- ADD THIS SNIPPET ---------

     const app = new TodoListApplication(options);

     // --------- ADD THIS SNIPPET ---------
     // If running on IBM Cloud, we get the Cloudant service details from VCAP_SERVICES
     if (!appEnv.isLocal) {
       // 'myCloudant' is the name of the provisioned Cloudant service
       const updatedDatasourceDb = Object.assign({}, datasourceDb, {
         url: appEnv.getServiceURL('myCloudant'),
       });
       app.bind('datasources.config.db').to(updatedDatasourceDb);
     }
     // --------- ADD THIS SNIPPET ---------
     await app.boot();
     await app.start();

     const url = app.restServer.url;
     console.log(`Server is running at ${url}`);
     return app;
   }
   ```

3. Remove the `prestart` script from `package.json`, since we don't want to do
   any building on the cloud.

{% include note.html content="
  If you make more changes to the application after this point, remember to run `npm run build` to transpile the code before deploying.
  " %}

4. (Optional) At project root, create a file called `.cfignore` with the
   following content:

   ```
   node_modules/
   .vscode/
   .git
   ```

   This step is optional, however, dependencies will be installed during
   deployment and thus `node_modules` will be generated. It makes the upload of
   `node_modules` reductant and time consuming.

### Step 5: Deploying the application to IBM Cloud

1. Use `cf login` command to login.

   If you're using a federated user id, you can use the `--sso` option.

   After you’ve been successfully logged in, you’ll see the CF API endpoint.

   ```
   API endpoint: https://api.ng.bluemix.net (API version: 2.106.0)
   ```

2. After logging in, you can run this command:

   ```sh
   cf push <<your-app-name>>
   ```

   The app name in the command is the Cloud Foundry application that will show
   up in the IBM Cloud dashboard.

### Step 6: Binding the Cloudant service to your application

1. Go to the IBM Cloud dashboard (https://cloud.ibm.com/dashboard/apps).
2. Under `Cloud Foundry Applications`, you should see your application name.
   Click on it.
3. In the "Overview" tab, go to `Connections` > `Create connection`.
4. Select `myCloudant` service.
5. After the binding is done, you should see it from the `Overview` page.
   ![create connection](../imgs/deploytocloud-createconnection.png)
6. You will be asked to restart your application.

### Step 7: Testing your endpoints

1. Go to your application page. If you're not already in there, it can be found
   under `Cloud Foundry Apps` in the
   [IBM Cloud dashboard](https://cloud.ibm.com/dashboard/apps).
2. Click `Visit App URL` to get the URL of your application. It will then bring
   you to the API explorer for testing your endpoints.
