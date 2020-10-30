---
lang: en
title: 'Tips for Application Setup'
keywords:
  LoopBack 4.0, LoopBack 4, Node.js, TypeScript, Application Setup,
  RestApplication
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Application-setup-tips.html
---

Here are some tips for application setup to help avoid common pitfalls and
mistakes.

### Extend from `RestApplication` when using `RestServer`

If you want to use `RestServer` from the `@loopback/rest` package, we recommend
extending `RestApplication` in your app instead of manually binding `RestServer`
or `RestComponent`. `RestApplication` already uses `RestComponent` and makes
useful functions in `RestServer` like `handler()` available at the app level.
This means you can call the `RestServer` functions to perform all of your
server-level setups in the app constructor without having to explicitly retrieve
an instance of your server.

### Serve static files

The `RestServer` allows static files to be served. It can be set up by calling
the `static()` API.

```ts
app.static('/html', rootDirForHtml);
```

or

```ts
server.static(['/html', '/public'], rootDirForHtml);
```

Static assets are not allowed to be mounted on `/` to avoid performance penalty
as `/` matches all paths and incurs file system access for each HTTP request.

The static() API delegates to
[serve-static](https://expressjs.com/en/resources/middleware/serve-static.html)
to serve static files. Please see
https://expressjs.com/en/starter/static-files.html and
https://expressjs.com/en/4x/api.html#express.static for details.

{% include warning.html content="The static assets are served before LoopBack sequence of actions. If an error is thrown, the `reject` action will NOT be triggered." %}

### Use unique bindings

Use binding names that are prefixed with a unique string that does not overlap
with LoopBack's bindings. As an example, if your application is built for your
employer FooCorp, you can prefix your bindings with `fooCorp`.

```ts
// This is unlikely to conflict with keys used by other component developers
// or within loopback itself!
app.bind('fooCorp.widgetServer.config').to(widgetServerConfig);
```

### Avoid use of `getSync`

We provide the
[`getSync`](https://loopback.io/doc/en/lb4/apidocs.context.context.getsync_1.html)
function for scenarios where you cannot asynchronously retrieve your bindings,
such as in constructor bodies.

However, the number of scenarios in which you must do this are limited, and you
should avoid potential race conditions and retrieve your bindings asynchronously
using the
[`get`](https://loopback.io/doc/en/lb4/apidocs.context.context.get_1.html)
function whenever possible.

### Use caution with singleton binding scopes

By default, bindings for controllers will instantiate a new instance whenever
they are injected or retrieved from their binding. Your application should only
set singleton binding scopes on controllers when it makes sense to do so.
