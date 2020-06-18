---
lang: en
title: 'Customizing how OpenAPI spec is served'
keywords: LoopBack 4.0, LoopBack 4, Node.js, OpenAPI, Customization
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Customizing-how-openapi-spec-is-served.html
---

By default, LoopBack REST API server provides endpoints exposing an OpenAPI spec
document describing application's API. You can configure this behavior using
`rest.openApiSpec` field in the configuration object passed to `RestApplication`
constructor.

- servers: Configure servers for OpenAPI spec

- setServersFromRequest: Set `servers` based on HTTP request headers, default to
  `false`

- disabled: Set to `true` to disable endpoints for the OpenAPI spec. It will
  disable API Explorer too.

- endpointMapping: Maps urls for various forms of the spec. Default to:

  ```js
  {
    '/openapi.json': {version: '3.0.0', format: 'json'},
    '/openapi.yaml': {version: '3.0.0', format: 'yaml'},
  }
  ```

Example application configuration object showing possible customizations:

{% include code-caption.html content="/src/index.ts" %}

```ts
const config: ApplicationConfig = {
    rest: {
    openApiSpec: {
      servers: [{url: 'http://127.0.0.1:8080'}],
      setServersFromRequest: false,
      endpointMapping: {
        '/openapi.json': {version: '3.0.0', format: 'json'},
        '/openapi.yaml': {version: '3.0.0', format: 'yaml'},
      },
    },
  };
});
```
