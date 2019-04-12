---
title: "Storage connector"
lang: en
layout: navgroup
navgroup: storage
keywords: LoopBack
tags: connectors
sidebar: lb3_sidebar
permalink: /doc/en/lb3/Storage-connector.html
summary: The storage connector enables LoopBack applications to interact with files on cloud storage providers and the local (server) file system.
---

## Installation

If you haven't yet installed the storage component, in your application root directory, enter:

```shell
$ npm install loopback-component-storage --save
```

This will install the module from npm and add it as a dependency to the application's [package.json](package.json.html) file.

## Creating a storage data source

Create a new push data source with the [data source generator](Data-source-generator.html).

When prompted, select **other** as the connector.

At the prompt "**Enter the connector name without the loopback-connector- prefix,**" enter **storage**.

This creates an entry in `datasources.json` like this (for example):

{% include code-caption.html content="/server/datasources.json" %}
```javascript
...
"myStorageDataSource": {
  "name": "myStorageDataSource",
  "connector": "loopback-component-storage"
}
...
```

## Configuring a storage data source

Configure a storage data source by editing the [datasources.json](datasources.json.html) file,
for example as shown in the [storage service example](https://github.com/strongloop/loopback-component-storage/blob/master/example-2.0/):

{% include code-caption.html content="/server/datasources.json" %}
```javascript
...
"myStorageDataSource": {
  "name": "myStorageDataSource",
  "connector": "loopback-component-storage",
  "provider": "filesystem",
  "root": "./server/storage"
}
...
```

## Creating a storage model

Use the [model generator](Model-generator.html) to create a new model, then edit the `model.json` file, 
as shown in the [storage service example](https://github.com/strongloop/loopback-example-storage):

{% include code-caption.html content="/server/models/container.json" %}
```javascript
{
  "name": "container",
  "base": "Model",
  "properties": {},
  "validations": [],
  "relations": {},
  "acls": [],
  "methods": []
}
```

## Connect the model to the storage data source

{% include code-caption.html content="/server/model-config.json" %}
```javascript
...
  "container": {
    "dataSource": "myStorageDataSource",
    "public": true
  }
...
```
