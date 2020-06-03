---
title: 'Running and debugging apps'
lang: en
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Debug
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Running-and-debugging-apps.html
summary:
---

In general, when you are developing an application, use the `npm` command to run
it. This enables you to see stack traces and console output immediately.

For example:

```
$ cd myapp
$ npm start
```

LoopBack 4 also allows you to specify debug strings that the application will
display to the console (or save to a file) to help you verify or diagnose the
app. See [Setting debug strings](Setting-debug-strings.md).
