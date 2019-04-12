---
title: "Push connector"
lang: en
layout: page
keywords: LoopBack
tags: connectors
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Push-connector.html
summary:
---

## Installation

If you haven't yet installed the Push component, in your application root directory, enter:

```shell
$ npm install loopback-component-push --save
```

This will install the module from npm and add it as a dependency to the application's 
[package.json](package.json.html) file.

## Creating a push data source

Create a new push data source with the [data source generator](Data-source-generator.html).

When prompted, select **other** as the connector.  

At the prompt "**Enter the connector name without the loopback-connector- prefix,**" enter **push**.

This creates an entry in `datasources.json` like this (for example):

{% include code-caption.html content="/server/datasources.json" %}
```javascript
...
 "myPushDataSource": {
    "name": "myPushDataSource",
    "connector": "push"
  }
 ...
```

## Configuring a push data source

To configure a push data source, edit the `datasources.json` file.
For example as shown in the [push example](https:/github.com/strongloop/loopback-component-push/blob/master/example/server-2.0/):

{% include code-caption.html content="/server/datasources.json" %}
```javascript
"myPushDataSource": {
    "name": "myPushDataSource",
    "connector": "push",
    "installation": "installation",
    "notification": "notification",
    "application": "application"
  }
}
```

## Defining a push model

Then define a push model in the [Model definition JSON file](Model-definition-JSON-file.html), for example:

{% include code-caption.html content="/server/models/push.json" %}
```javascript
{
  "name": "push",
  "base": "Model",
  "plural": "Push",
  "properties": {},
  "validations": [],
  "relations": {},
  "acls": [],
  "methods": []
}
```

## Connect model to push data source

Connect the model to the data source:

{% include code-caption.html content="/server/model-config.json" %}
```javascript
"push": {
    "public": true,
    "dataSource": "myPushDataSource"
  }
```
