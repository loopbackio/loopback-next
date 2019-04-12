---
title: "Swagger connector"
lang: en
layout: page
keywords: LoopBack
tags: connectors
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Swagger-connector.html
summary: The Swagger connector enables LoopBack applications to interact with other RESTful APIs described using the OpenAPI (Swagger) specification.
---

# loopback-connector-swagger

The Swagger connector enables LoopBack applications to interact with other RESTful APIs described using
[OpenAPI (Swagger) specification v.2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md).

### Configure a Swagger data source

To interact with a Swagger API, we first configure a data source backed by the Swagger connector:

### Options for the Swagger connector

* **spec:** http url or local file system path to the swagger specification file (Specification file must be of `.yaml/.yml` or `.json` extension) or the specification.

**Note:** Current implementation supports relative local path to the current working directory (i.e. `process.cwd()`).

- **validate:** when `true`, validates provided `spec` against Swagger specification 2.0 before initializing a data source.
  default: `false`
- **security:** security configuration for making authenticated requests to the API.
  Supports three types of security schemes: basic authentication, API Key & OAuth2

* Basic authentication:

* API Key:

* OAuth2:

**Note**: value of `name` must correspond to a security scheme declared in the
[Security Definitions object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#security-definitions-object) within `spec` document.

### Create a model from the Swagger data source

**NOTE:** The Swagger connector loads the API specification document asynchronously.
As a result, the data source won't be ready to create models until it is connected.
The recommended way is to use an event handler for the `connected` event of data source:

```
ds.once('connected', function(){
  var PetService = ds.createModel('PetService', {});
  //...
});
```

Once the model is created, all available Swagger API operations can be accessed as model methods.

For example:

```javascript
PetService.getPetById({petId: 1}, function (err, res){
  //...
});
```

### Extend a model to wrap/mediate API Operations

Once the model is defined, it can be wrapped or mediated to define new methods.
The following example simplifies the `getPetById` operation to a method that takes `petID` and returns a Pet instance.

This custom method on the `PetService` model can be exposed as REST API end-point. It uses the `loopback.remoteMethod` to define the mappings:

### Example

_`coming soon...`_
