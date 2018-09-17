---
lang: en
title: Error Handling
keywords: LoopBack 4.0
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Error-handling.html
---

## Known Error Codes

In order to allow clients to reliably detect individual error causes, LoopBack
sets the error `code` property to a machine-readable string.

| Error code       | Description                                                                                                                                                                                                              |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ENTITY_NOT_FOUND | The entity (model) was not found. This error is returned for example by [`EntityCrudRepository.prototype.findById`](http://apidocs.loopback.io/@loopback%2fdocs/repository.html#EntityCrudRepository.prototype.findById) |

Besides LoopBack-specific error codes, your application can encounter low-level
error codes from Node.js and the underlying operating system. For example, when
a connector is not able to reach the database, an error with code `ECONNREFUSED`
is returned.

See the following resources for a list of low-level error codes:

- [Common System Errors](https://nodejs.org/api/errors.html#errors_common_system_errors)
- [Node.js Error Codes](https://nodejs.org/api/errors.html#errors_node_js_error_codes)
