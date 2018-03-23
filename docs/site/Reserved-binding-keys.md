---
lang: en
title: 'Reserved binding keys'
keywords: LoopBack 4.0, LoopBack 4
toc_level: 1
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Reserved-binding-keys.html
summary:
---

## Overview

When using [dependency injection](Dependency-injection.md) there are a few
things to keep in mind with regards to binding keys.

Different packages and components for LoopBack 4 may have some bindings already
defined. You can change the default behavior by overriding the default binding,
but you must ensure the interface of the new binding is the same as the default
(but behavior can be different).

Following is a list that documents the binding keys in use by various
`@loopback` packages and their `Type` so you can easily look at their interface
in the [API Docs](http://apidocs.loopback.io).

It is recommended to use the CONSTANT defined for each binding key in it's
respective namespace. You can import a namespace and access the binding key in
your application as follows:

```js
import {BindingKeyNameSpace} from 'package-name';
app.bind(BindKeyNameSpace.KeyName).to('value');
```

{% include note.html title="Declaring new binding keys" content="For component
developers creating a new Binding, to avoid conflict with other packages, it is
recommended that the binding key start with the package name as the prefix.
Example: `@loopback/authentication` component uses the prefix `authentication`
for its binding keys. " %}

## Package: authentication

**Reserved prefixes:**

```text
authentication.*
```

### CONSTANT Namespace

```js
import {AuthenticationBindings} from '@loopback/authentication';
```

### Binding keys

**Sequence Actions binding keys**

| Name                                  | CONSTANT      | `Type`           | Description                                                         |
| ------------------------------------- | ------------- | ---------------- | ------------------------------------------------------------------- |
| `authentication.actions.authenticate` | `AUTH_ACTION` | `AuthenticateFn` | Provides the authenticate function to be called in Sequence action. |

**Other binding keys**

| Name                               | CONSTANT       | Type                     | Description                                                |
| ---------------------------------- | -------------- | ------------------------ | ---------------------------------------------------------- |
| `authentication.currentUser`       | `CURRENT_USER` | `UserProfile`            | Authenticated user profile for the current request         |
| `authentication.operationMetadata` | `METADATA`     | `AuthenticationMetadata` | Authentication Metadata                                    |
| `authentication.strategy`          | `STRATEGY`     | `Strategy`               | Provider for a [passport](http://passportjs.org/) strategy |

## Package: context

**Reserved prefixes:**

```text
context.*
```

### Binding keys

_None_

## Package: core

**Reserved prefixes:**

```text
core.*
```

```text
controllers.*
```

### CONSTANT Namespace

```js
import {CoreBindings} from '@loopback/authentication';
```

### Binding keys

| Name                             | CONSTANT                 | Type                 | Description                                                                 |
| -------------------------------- | ------------------------ | -------------------- | --------------------------------------------------------------------------- |
| `application.apiSpec`            | `API_SPEC`               | `OpenApiSpec`        | OpenAPI Specification describing your application's routes                  |
| `bindElement`                    | `BIND_ELEMENT`           | `BindElement`        | Convenience provider function to bind value to `Context`                    |
| `components.${component.name}`   |                          | `Component`          | Components used by your application                                         |
| `controllers.${controller.name}` |                          | `ControllerClass`    | The controller's bound to the application                                   |
| `controller.current.ctor`        | `CONTROLLER_CLASS`       | `ControllerClass`    | The controller for the current request                                      |
| `controller.current.operation`   | `CONTROLLER_METHOD_NAME` | `string`             | Name of the operation for the current request                               |
| `controller.method.meta`         | `CONTROLLER_METHOD_META` | `ControllerMetaData` | Metadata for a given controller                                             |
| `getFromContext`                 | `GET_FROM_CONTEXT`       | `GetFromContext`     | Convenience provider function to return the `BoundValue` from the `Context` |

## Package: rest

| Name                                         | CONSTANT        | Type              | Description                           |
| -------------------------------------------- | --------------- | ----------------- | ------------------------------------- |
| `rest.handler`                               | `HANDLER`       | `HttpHandler`     | The HTTP Request Handler              |
| `rest.port`                                  | `PORT`          | `number`          | HTTP Port the application will run on |
| `rest.http.request`                          | `Http.REQUEST`  | `ServerRequest`   | The raw `http` request                |
| object                                       |                 |                   |                                       |
| `rest.http.request.context`                  | `Http.CONTEXT`  | `Context`         | Request level                         |
| context                                      |                 |                   |                                       |
| `rest.http.response`                         | `Http.RESPONSE` | `ServerResponse`  | The raw `http`                        |
| response object                              |                 |                   |                                       |
| `routes.${route.verb}.${route.path}`         |                 | `RouteEntry`      | Route entry                           |
| specified in api-spec                        |                 |                   |                                       |
| `rest.sequence`                              | `SEQUENCE`      | `SequenceHandler` | Class that                            |
| implements the sequence for your application |                 |                   |                                       |

**Rest Sequence Action Binding Keys**

To use the Rest Sequence Actions CONSTANTs, bind/inject to
`RestBindings.SequenceActions.CONSTANT` _OR_

```js
const SequenceActions = RestBindings.SequenceActions;
SequenceActions.CONSTANT; // CONSTANT to bind/inject
```

| Name                            | CONSTANT        | Type           | Description                                                                     |
| ------------------------------- | --------------- | -------------- | ------------------------------------------------------------------------------- |
| `sequence.actions.findRoute`    | `FIND_ROUTE`    | `FindRoute`    | Sequence action to find the route for a given request                           |
| `sequence.actions.invokeMethod` | `INVOKE_METHOD` | `InvokeMethod` | Sequence action to invoke the operation method defined for the requested route  |
| `sequence.actions.logError`     | `LOG_ERROR`     | `LogError`     | Sequence action to log information about a failed request                       |
| `sequence.actions.parseParams`  | `PARSE_PARAMS`  | `ParseParams`  | Sequence action to parse a request for arguments to be passed to the controller |
| `sequence.actions.reject`       | `REJECT`        | `Reject`       | Sequence action to reject the request with an error                             |
| `sequence.actions.send`         | `SEND`          | `Send`         | Sequence action to send the response back to client                             |

## Package: openapi-spec

**Reserved prefixes:**

```text
api-spec.*
```

### Binding keys

_None_

## Package: openapi-spec-builder

**Reserved prefixes:**

```text
spec-builder.*
```

### Binding keys

_None_

## Package: repository

**Reserved prefixes:**

```text
repository.*
```

```text
repositories.*`
```

```text
datasources.*
```

```text
models.*
```

### Binding keys

| Name                             | CONSTANT | Type         | Description                    |
| -------------------------------- | -------- | ------------ | ------------------------------ |
| `datasources.${dataSourceName}`  |          | `DataSource` | Instance of a given datasource |
| `models.${modelName}`            |          | `Model`      | Instance of a given model      |
| `repositories.${repositoryName}` |          | `Repository` | Instance of a given repository |

## Package: testlab

**Reserved prefixes:**

```text
testlab.*
```

### Binding keys

_None_
