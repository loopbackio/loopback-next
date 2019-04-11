---
title: "Using mLab*"
lang: en
layout: page
keywords: LoopBack
tags:
sidebar: lb3_sidebar
permalink: /doc/en/lb3/Using-MongoLab.html
summary:
---

If you are using [mLab](https://mlab.com/) to host your MongoDB database, use the LoopBack `url` property to configure your data source,
since the connection string is dynamically generated.

For example, the entry in `datasources.json` might look like this: 

{% include code-caption.html content="/server/datasources.json" %}
```javascript
"mongodb": {
  "connector": "loopback-connector-mongodb",
  "url": "mongodb://localhost:27017/mydb"
}
```

For information on how to get your connection URI, see the [mLab documentation](https://devcenter.heroku.com/articles/mongolab#getting-your-connection-uri).
