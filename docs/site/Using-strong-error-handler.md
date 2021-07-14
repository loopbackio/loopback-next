---
title: 'Using strong-error-handler'
lang: en
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Error handling
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Using-strong-error-handler.html
---

# strong-error-handler

As a dependency of
[`@loopback/rest`](https://github.com/strongloop/loopback-next/tree/master/packages/rest),
package `strong-error-handler` is an error handler for use in both development
(debug) and production environments.

In LoopBack 4, the request handling process starts with the app's
[sequence](https://loopback.io/doc/en/lb4/Sequence.html), a simple class with
five injected helper methods in the constructor. It is the gatekeeper of all
requests to the app. Errors are handled by one of the Sequence actions,
[`reject`](REST-middleware-sequence.md#handling-errors), which calls
`strong-error-handler` package to send back an HTTP response describing the
error.

LoopBack 4 apps require 3.x versions of `strong-error-handler`.

## Usage

In production mode (default), `reject` omits details from error responses to
prevent leaking sensitive information.

In debug mode, `reject` also can return full error stack traces and internal
details of any error objects to the client in the HTTP responses. Once the
`debug` flag is set, `strong-error-handler` would handle such options.

```ts
app.bind(RestBindings.ERROR_WRITER_OPTIONS).to({debug: true});
```

Please check the
[Action based Sequence for REST Server - Handling errors](REST-action-sequence.md#handling-errors)
and
[Middleware-based Sequence for REST Server - Handling errors](REST-middleware-sequence.md#handling-errors)
sections for usages and examples of these two modes.

In general, `reject` is executed in `try {} catch(err) {}` block.
`strong-error-handler` is the last utility to be used.

The above configuration will log errors to the server console, but not return
stack traces in HTTP responses. The behaviors of the error handler are also
configurable by setting other options to `ERROR_WRITER_OPTIONS`. For details on
available options, see below.

## Options

| Option               | Type                      | Default  | Description                                                                                                                                                                                                                                                                                                                                               |
| -------------------- | ------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| debug                | Boolean&nbsp;&nbsp;&nbsp; | `false`  | If `true`, HTTP responses include all error properties, including sensitive data such as file paths, URLs and stack traces. See [Example output](#example) below.                                                                                                                                                                                         |
| log                  | Boolean                   | `true`   | If `true`, all errors are printed via `console.error`, including an array of fields (custom error properties) that are safe to include in response messages (both 4xx and 5xx). <br/> If `false`, sends only the error back in the response.                                                                                                              |
| safeFields           | [String]                  | `[]`     | Specifies property names on errors that are allowed to be passed through in 4xx and 5xx responses. See [Safe error fields](#safe-error-fields) below.                                                                                                                                                                                                     |
| defaultType          | String                    | `"json"` | Specify the default response content type to use when the client does not provide any Accepts header.                                                                                                                                                                                                                                                     |
| negotiateContentType | Boolean                   | true     | Negotiate the response content type via Accepts request header. When disabled, strong-error-handler will always use the default content type when producing responses. Disabling content type negotiation is useful if you want to see JSON-formatted error responses in browsers, because browsers usually prefer HTML and XML over other content types. |

### Safe error fields

By default, `strong-error-handler` will only pass through the `name`, `message`
and `details` properties of an error. Additional error properties may be allowed
through on 4xx and 5xx status code errors using the `safeFields` option to pass
in an array of safe field names:

```ts
app.bind(RestBindings.ERROR_WRITER_OPTIONS).to({safeFields: ['errorCode']});
```

Using the above configuration, an error containing an `errorCode` property will
produce the following response:

```
{
  "error": {
    "statusCode": 500,
    "message": "Internal Server Error",
    "errorCode": "INTERNAL_SERVER_ERROR"
  }
}
```

## Response format and content type

The `strong-error-handler` package supports JSON, HTML and XML responses:

- When the object is a standard Error object, it returns the string provided by
  the stack property in HTML/text responses.
- When the object is a non-Error object, it returns the result of `util.inspect`
  in HTML/text responses.
- For JSON responses, the result is an object with all enumerable properties
  from the object in the response.

The content type of the response depends on the request's `Accepts` header.

- For Accepts header `json` or `application/json`, the response content type is
  JSON.
- For Accepts header `html` or `text/html`, the response content type is HTML.
- For Accepts header `xml` or `text/xml`, the response content type is XML.

_There are plans to support other formats such as `text/plain`._

## Migration from LoopBack 3 error handler

Unlike LoopBack 3’s phase-based middleware routing system, LB4 uses a sequence
handler that sits in front of a routing table and handles errors. To learn the
differences and how `strong-error-handler` is being used in LB4, see
[LB3 vs LB4 request response cycle](LB3-vs-LB4-request-response-cycle.md).

## Example

5xx error generated when `debug: false` :

```
{ error: { statusCode: 500, message: 'Internal Server Error' } }
```

The same error generated when `debug: true` :

```
{ error:
  { statusCode: 500,
  name: 'Error',
  message: 'a test error message',
  stack: 'Error: a test error message
  at Context.<anonymous> (User/strong-error-handler/test/handler.test.js:220:21)
  at callFnAsync (User/strong-error-handler/node_modules/mocha/lib/runnable.js:349:8)
  at Test.Runnable.run (User/strong-error-handler/node_modules/mocha/lib/runnable.js:301:7)
  at Runner.runTest (User/strong-error-handler/node_modules/mocha/lib/runner.js:422:10)
  at User/strong-error-handler/node_modules/mocha/lib/runner.js:528:12
  at next (User/strong-error-handler/node_modules/mocha/lib/runner.js:342:14)
  at User/strong-error-handler/node_modules/mocha/lib/runner.js:352:7
  at next (User/strong-error-handler/node_modules/mocha/lib/runner.js:284:14)
  at Immediate._onImmediate (User/strong-error-handler/node_modules/mocha/lib/runner.js:320:5)
  at tryOnImmediate (timers.js:543:15)
  at processImmediate [as _immediateCallback] (timers.js:523:5)' }}
```

4xx error generated when `debug: false` :

```
{ error:
  { statusCode: 422,
  name: 'Unprocessable Entity',
  message: 'Missing required fields',
  code: 'MISSING_REQUIRED_FIELDS' }}
```
