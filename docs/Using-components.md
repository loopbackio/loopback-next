---
lang: en
title: 'Using components'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Using-components.html
summary:
---
Components are an important part of LoopBack 4. We are keeping the core small and easy to extend, making it easy for independent developers to contribute additional features to LoopBack. Components are the vehicle for bringing more goodness to your applications.

A typical LoopBack component is an [npm](https://www.npmjs.com/) package exporting a Component class which can be added to your application.

```js
import {Application} from '@loopback/core';
import {AuthenticationComponent} from '@loopback/authentication';

const app = new Application();
app.component(AuthenticationComponent);
```

In general, components can contribute the following items:

 - [Controllers](Controllers.md)
 - Providers of additional [Context values](Context.md)

In the future (before the GA release), components will be able to contribute additional items:

 - Models
 - [Repositories](Repositories.md)
