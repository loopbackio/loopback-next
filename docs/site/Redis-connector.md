---
title: "Redis connector"
lang: en
layout: page
toc: false
keywords: LoopBack
tags: connectors
sidebar: lb3_sidebar
permalink: /doc/en/lb3/Redis-connector.html
summary: The Redis connector enables LoopBack applications to connect to Redis data sources.
---

{% include content/strongloop-labs.html lang=page.lang %}

{% include toc.html %}

{% include note.html content="The Redis connector requires Redis 3.0.3+.
" %}

## Installation

In your application root directory, enter this command to install the connector:

```shell
$ npm install loopback-connector-redis --save
```

This will install the module and add it as a dependency to the application's [`package.json`](package.json) file.

## Creating a Redis data source

Use the [data source generator](Data-source-generator.html) to add a Redis data source to your application.
When prompted for the connector, choose **other,** then enter **redis** for the connector name.
The entry in the application's `server/datasources.json` will look like this:

{% include code-caption.html content="server/datasources.json" %}
```javascript
"redisDS": {
  "name": "redisDS",
  "connector": "redis",
}
```

Edit `datasources.json` to add other properties that enable you to connect the data source to a Redis database.

### Properties

<table>
  <tbody>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
    <tr>
      <td>connector</td>
      <td>String</td>
      <td>
        <p>Connector name, either "loopback-connector-redis" or "redis"</p>
      </td>
    </tr>
    <tr>
      <td>database</td>
      <td>String</td>
      <td>Database name</td>
    </tr>
    <tr>
      <td>host</td>
      <td>String</td>
      <td>
        Database host name. For connector versions <= v0.1.0, when this property is set, 
        the port property **must also** be set.
      </td>
    </tr>
    <tr>
      <td>password</td>
      <td>String</td>
      <td>Password to connect to database</td>
    </tr>
    <tr>
      <td>port</td>
      <td>Number</td>
      <td>Database TCP port</td>
    </tr>
    <tr>
      <td>url</td>
      <td>String</td>
      <td>Use instead host and port properties.</td>
    </tr>
    <tr>
      <td>username</td>
      <td>String</td>
      <td>Username to connect to database</td>
    </tr>
  </tbody>
</table>
