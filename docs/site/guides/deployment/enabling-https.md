---
lang: en
title: 'Enabling HTTPS'
keywords: LoopBack 4.0, LoopBack 4, Node.js, HTTPS, Deployment
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Enabling-https.html
---

Enabling HTTPS for the LoopBack REST server is just a matter of updating the
`rest` section of application configuration:

1. Specify the protocol as `https`.
2. Provide TLS server credentials.

Example:

```ts
const config = {
  rest: {
    protocol: 'https',
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    // port, host, etc.
  },
};
```

See
[Node.js documentation](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)
for supported forms of HTTPS/TLS credentials, in particular
[`tls.createSecureContext()` options](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options).

In the following app, we configure HTTPS for a bare minimum app using a key +
certificate chain variant.

{% include code-caption.html content="/src/index.ts" %}

```ts
import {ApplicationConfig, TodoListApplication} from './application';

export async function main(options: ApplicationConfig = {}) {
  // left out for brevity
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST ?? 'localhost',
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },

      // Enable HTTPS
      protocol: 'https',
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
```
