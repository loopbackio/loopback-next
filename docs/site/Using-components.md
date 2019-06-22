---
lang: en
title: 'Using components'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Using-components.html
---

Components serve as a vehicle to group 3rd-party contributions to allow easier
extensibility of your Application, see [Components](Components.md) for more
details.

Components can be added to your application using the `app.component()` method.

The following is an example of installing and using a component.

Install the following dependencies:

```sh
npm install --save @loopback/authentication
```

Load the component in your application:

```ts
import {RestApplication} from '@loopback/rest';
import {AuthenticationComponent} from '@loopback/authentication';

const app = new RestApplication();
// Add component to Application, which provides bindings used to resolve
// authenticated requests in a Sequence.
app.component(AuthenticationComponent);
```
