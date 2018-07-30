# How to deploy the app locally and on IBM Cloud

This is the guide for deploying the Todo app locally and on IBM Cloud.

## Database setup

The app, when running locally, connects to a local instance of Cloudant; when
deployed to IBM Cloud, it connects to a provisioned Cloudant instance.

### Local

Follow the steps:

1.  [Install Docker](https://www.docker.com/).
2.  [Download Cloudant image](https://hub.docker.com/r/ibmcom/cloudant-developer/).
3.  Ensure port `8080` is free and start Cloudant:

```
docker run \
       --detach \
       --volume cloudant:/srv \
       --name cloudant-developer \
       --publish 8080:80 \
       --hostname cloudant.dev \
       ibmcom/cloudant-developer
```

4.  Log on to the local [Cloudant Dashboard](http://localhost:8080/dashboard.html) using `admin:pass` as the crendentials.
5.  Create a database named `todo`.
6.  Add a new document:

```
{
  "title": "I AM A LOCAL",
  "desc": "I call 127.0.0.1 my home",
  "loopback__model__name": "Todo"
}
```

7.  Set the `url` property of `db.datasource.json` to `http://admin:pass@localhost:8080`, which is where we can access the locally running Cloudant instance.

### IBM Cloud

Follow the steps:

1.  Log on to IBM Cloud.
2.  Create a [Node.js SDK app](https://console.bluemix.net/catalog/starters/sdk-for-nodejs).
3.  Provision a [Cloudant service](https://console.bluemix.net/catalog/services/cloudant). Give this a name, which is the same as the name of the datasource configured in `db.datasource.json`. This is to indicate that this service is the corresponding datasource on IBM Cloud.
4.  Log on to the IBM Cloud Cloudant Dashboard.
5.  Create a database named `todo`.
6.  Add a new document:

```
{
  "title": "I AM ON IBM CLOUD",
  "desc": "Yes, I am!",
  "loopback__model__name": "Todo"
}
```

7.  Add a new field in `db.datasource.json` named `ibmCloud`, and set it to `true`. This is to indicate that there is a corresponding provisioned service on IBM Cloud, which should be used instead of the locally configured datasource in the `url` property, when the app is runnong on IBM Cloud.
8.  Connect the Cloudant service to the Node.js SDK app created in step 2.

## Deployment

### Local

1.  Add `loopback-cloudant-connector` to dependecies in `package.json`.
2.  Install all dependencies:

```
npm i
```

3.  Build the app:

```
npm run build
```

This is a must, if switched from a another branch.

4.  Ensure Cloudant is running locally.
5.  Start the app:

```
npm start
```

6.  Load `http://localhost:3000/todos` to see:

```
[{"id":null,"title":"I AM A LOCAL","desc":"I call 127.0.0.1 my home"}]
```

### IBM Cloud

1.

1.  Add a `.cfignore` file with the following content:

```
.git/
node_modules/
vcap-local.js
.vscode/
```

This is to avoid uploading the listed files and directories to IBM Cloud.

2.  Add a `manifest.yml` file with the details of the app:

```
---
applications:
- instances: 1
  timeout: 256
  name: LB4-0001
  buildpack: sdk-for-nodejs
  command: npm start
  memory: 128M
  domain: eu-gb.mybluemix.net
  host: lb4-0001
```

`LB4-0001` is the name of the app that was created from the example.

3.  Remove the `prestart` script from `package.json`, since we don't want to build
    the app on Cloud.

4)  Build the app locally:

```
npm run build
```

This is a must, if switched from a another branch.

5.  Push the app to IBM Cloud:

```
cf push lb4-0001
```

6.  Load https://lb4-0001.eu-gb.mybluemix.net/todos to see:

```
[{"id":null,"title":"I AM ON IBM CLOUD","desc":"Yes, I am!"}]
```

## Pain points

Some pain points from the overall experience.

### IBM Cloud

1.  Service-connecting service (the service which binds Node.js app to Cloudant)
    was down for some time.
2.  Could not see the created app for some time because of UI bug(s).
3.  The button for downloading the scaffolded app is not there anymore. No easy
    way to get the code that was generated. This will greatly help in understanding
    the gnerated IBM Cloud artifacts and the specifics for Node.js apps. I used the
    sample app I created with Nana Amfo a month or so ago.

### LoopBack

1.  Model configuration change is drastic.
2.  Repository creation and linking to a model is manual. There should be a
    provision to do these from the `lb` commands.
3.  There no API Explorer to play around with the models.
