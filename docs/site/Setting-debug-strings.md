---
title: 'Setting debug strings'
lang: en
keywords:
  LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, base-connector.js
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Setting-debug-strings.html
summary:
---

You can specify debug strings when you run an application, as explained below,
to display specific log output to the console. You can also redirect the output
to a file, if desired. These techniques are often helpful in debugging
applications.

## Using debug strings

LoopBack has a number of built-in debug strings to help with debugging. Specify
a string on the command-line via an environment variable as follows:

**MacOS and Linux**

```shell
$ DEBUG=<pattern>[,<pattern>...] npm start
```

**Windows**

```shell
C:\> set DEBUG=<pattern>[,<pattern>...]
C:\> npm start
```

where &lt;_pattern_&gt; is a string-matching pattern specifying debug strings to
match. You can specify as many matching patterns as you wish.

For example (MacOS and Linux):

```shell
$ DEBUG=loopback:datasource npm start
```

Or, on Windows:

```shell
C:\> set DEBUG=loopback:datasource
C:\> npm start
```

You'll see output such as (truncated for brevity):

```
loopback:datasource Settings: {"name":"db","debug":true} -0ms
loopback:datasource Settings: {"name":"geo","connector":"rest",...
```

You can use an asterisk  (`*`) in the pattern to match any string. For example
the following would match any debug string containing "oracle":

```shell
$ DEBUG=*oracle npm start
```

You can also exclude specific debuggers by prefixing them with a "-" character.
For example, `DEBUG=*,-rest-crud:*` would include all debuggers except those
starting with "rest-crud:".

## Debug string format

These strings have the format

`module[:area]:string`

Where:

- _module_ is the name of the module, for example `loopback` or
  `loopback-connector-mongodb`.
- _area_ is an optional identifier such as `cli` or `repository` to identify the
  purpose of the module
- _string_ is the debug string specified in the target TypeScript/JavaScript
  source file, such as `application.ts`.

For example:

`loopback:cli:model-generator`

The debug string `model-generator` is specified in the source file 
[`generators/model/index.js`](https://github.com/loopbackio/loopback-next/blob/master/packages/cli/generators/model/index.js)
of the `@loopback/cli` module.

## Debug strings reference

<table>
  <tbody>
    <tr>
      <th width="240">Module</th>
      <th width="330">Source file</th>
      <th width="330">String</th>
    </tr>
    <tr>
      <th colspan="2">@loopback</th>
    </tr>
    <tr>
      <td>@loopback/authorization</td>
      <td>src/authorize-interceptor.ts</td>
      <td>loopback:authorization:interceptor</td>
    </tr>
    <tr>
      <td>@loopback/boot</td>
      <td>src/bootstrapper.ts</td>
      <td>loopback:boot:bootstrapper</td>
    </tr>
    <tr>
      <td></td>
      <td>src/booters/interceptor.booter.ts</td>
      <td>loopback:boot:interceptor-booter</td>
    </tr>
    <tr>
      <td></td>
      <td>src/booters/lifecycle-observer.booter.ts</td>
      <td>loopback:boot:lifecycle-observer-booter</td>
    </tr>
    <tr>
      <td></td>
      <td>src/booters/model-api.booter.ts</td>
      <td>loopback:boot:model-api</td>
    </tr>
    <tr>
      <td></td>
      <td>src/booters/service.booter.ts</td>
      <td>loopback:boot:service-booter</td>
    </tr>
    <tr>
      <td>@loopback/booter-lb3app</td>
      <td>src/lb3app.booter.ts</td>
      <td>loopback:boot:lb3app</td>
    </tr>
    <tr>
      <td>@loopback/cron</td>
      <td>src/cron.component.ts</td>
      <td>loopback:cron</td>
    </tr>
    <tr>
      <td>@loopback/rest-crud</td>
      <td>src/crud-rest-builder.ts</td>
      <td>loopback:boot:crud-rest</td>
    </tr>
    <tr>
      <td>@loopback/cli</td>
      <td>please check each generator</td>
      <td>loopback:cli:_string_</td>
    </tr>
    <tr>
      <td>@loopback/context</td>
      <td>src/interceptor.ts</td>
      <td>loopback:context:interceptor</td>
    </tr>
    <tr>
      <td></td>
      <td>src/binding.ts</td>
      <td>loopback:context:binding</td>
    </tr>
    <tr>
      <td></td>
      <td>src/context-view.ts</td>
      <td>loopback:context:view</td>
    </tr>
     <tr>
      <td></td>
      <td>src/invocation.ts</td>
      <td>loopback:context:invocation</td>
    </tr>
    <tr>
      <td></td>
      <td>src/interceptor-chain.ts</td>
      <td>loopback:context:interceptor-chain</td>
    </tr>
    <tr>
      <td>@loopback/http-caching-proxy</td>
      <td>src/http-caching-proxy.ts</td>
      <td>loopback:http-caching-proxy</td>
    </tr>
    <tr>
      <td>@loopback/core</td>
      <td>src/lifecycle-registry.ts</td>
      <td>loopback:core:lifecycle</td>
    </tr>
    <tr>
      <td></td>
      <td>src/application.ts</td>
      <td>loopback:core:application</td>
    </tr>
    <tr>
      <td>@loopback/openapi-v3</td>
      <td>src/<sup>&#42;</sup></td>
      <td>loopback:openapi</td>
    </tr>
    <tr>
      <td>@loopback/repository</td>
      <td>src/relations/belongs-to/belongs-to.accessor.ts</td>
      <td>loopback:repository:relations:belongs-to:accessor</td>
    </tr>
    <tr>
      <td></td>
      <td>src/relations/belongs-to/belongs-to.accessor.ts</td>
      <td>loopback:repository:relations:belongs-to:accessor</td>
    </tr>
    <tr>
      <td></td>
      <td>src/relations/belongs-to/belongs-to.helpers.ts</td>
      <td>loopback:repository:relations:belongs-to:helpers</td>
    </tr>
    <tr>
      <td></td>
      <td>src/relations/has-many/has-many.helpers.ts</td>
      <td>loopback:repository:relations:has-many:helpers</td>
    </tr>
    <tr>
      <td></td>
      <td>src/relations/has-many/has-many.inclusion-resolver.ts</td>
      <td>loopback:repository:relations:has-many:inclusion-resolver</td>
    </tr>
    <tr>
      <td></td>
      <td>src/relations/has-many/has-many.repository-factory.ts</td>
      <td>loopback:repository:relations:has-many:repository-factory</td>
    </tr>
    <tr>
      <td></td>
      <td>src/relations/has-many/has-many-through.helpers.ts</td>
      <td>loopback:repository:relations:has-many-through:helpers</td>
    </tr>
    <tr>
      <td></td>
      <td>src/relations/has-many/has-many-through.inclusion-resolver.ts</td>
      <td>loopback:repository:relations:has-many-through:inclusion-resolver</td>
    </tr>
    <tr>
      <td></td>
      <td>src/relations/has-one/has-one.helpers.ts</td>
      <td>loopback:repository:relations:has-one:helpers</td>
    </tr>
    <tr>
      <td></td>
      <td>src/relations/has-one/has-one.repository-factory.ts</td>
      <td>loopback:repository:relations:has-one:repository-factory</td>
    </tr>
    <tr>
      <td>@loopback/repository-json-schema</td>
      <td>src/build-schema.ts</td>
      <td>loopback:repository-json-schema:build-schema</td>
    </tr>
    <tr>
      <td>@loopback/rest</td>
      <td>src/rest-server/</td>
      <td>loopback:rest:server</td>
    </tr>
    <tr>
      <td></td>
      <td>src/sequence.ts</td>
      <td>loopback:rest:sequence</td>
    </tr>
    <tr>
      <th colspan="2"><span>loopback-datasource-juggler</span></th>
    </tr>
    <tr>
      <td></td>
      <td>lib/datasource.js</td>
      <td>loopback:datasource</td>
    </tr>
    <tr>
      <th colspan="2">Connectors</th>
    </tr>
    <tr>
      <td>loopback-connector</td>
      <td>lib/connector.js</td>
      <td>loopback:connector</td>
    </tr>
    <tr>
      <td>loopback-connector-cassandra</td>
      <td>lib/cassandra.js</td>
      <td>loopback:connector:cassandra</td>
    </tr>
    <tr>
      <td>loopback-connector-cloudant</td>
      <td>lib/cloudant.js</td>
      <td>loopback:connector:cloudant</td>
    </tr>
    <tr>
      <td>loopback-connector-couchdb2</td>
      <td>lib/couchdb2.js</td>
      <td>loopback:connector:couchdb2</td>
    </tr>
    <tr>
      <td>loopback-connector-dashdb</td>
      <td>lib/dashdb.js</td>
      <td>loopback:connector:dashdb</td>
    </tr>
    <tr>
      <td>loopback-connector-db2</td>
      <td>lib/db2.js</td>
      <td>loopback:connector:db2</td>
    </tr>
    <tr>
      <td>loopback-connector-ibmi</td>
      <td>lib/ibmiconnector.js</td>
      <td>loopback:connector:ibmiconnector</td>
    </tr>
    <tr>
      <td>loopback-connector-kv-redis</td>
      <td>lib/kv-redis.js</td>
      <td>loopback:connector:kv-redis</td>
    </tr>
    <tr>
      <td>loopback-connector-mongodb</td>
      <td>lib/mongodb.js</td>
      <td>loopback:connector:mongodb</td>
    </tr>
    <tr>
      <td>loopback-connector-mssql</td>
      <td>lib/mssql.js</td>
      <td>loopback:connector:mssql</td>
    </tr>
    <tr>
      <td>loopback-connector-mysql</td>
      <td>lib/mysql.js</td>
      <td>loopback:connector:mysql</td>
    </tr>
    <tr>
      <td>loopback-connector-oracle</td>
      <td>lib/oracle.js</td>
      <td>loopback:connector:oracle</td>
    </tr>
    <tr>
      <td>loopback-connector-postgresql</td>
      <td>lib/postgresql.js</td>
      <td>loopback:connector:postgresql</td>
    </tr>
    <tr>
      <td>loopback-connector-rest</td>
      <td>lib/rest-builder.js</td>
      <td>loopback:connector:rest</td>
    </tr>
    <tr>
      <td></td>
      <td>lib/rest-connector.js</td>
      <td>loopback:connector:rest</td>
    </tr>
    <tr>
      <td></td>
      <td>lib/rest-model.js</td>
      <td>loopback:connector:rest</td>
    </tr>
    <tr>
      <td></td>
      <td>lib/swagger-client.js</td>
      <td>loopback:connector:rest:swagger</td>
    </tr>
    <tr>
      <td>loopback-connector-soap</td>
      <td>lib/soap-connector.js</td>
      <td>loopback:connector:soap</td>
    </tr>
  </tbody>
</table>

## Adding debugs

As seen before, LoopBack has built-in debug strings to help with debugging.

LoopBack uses the `debug` package internally. Even if there's no mandate for
LoopBack users to use the same library, you can use this package in your
application to help with debugging.

To do so, you can define your own debug strings like demonstrated in this
example:

```ts
// Import from debug
import debugFactory from 'debug';

// Define your custom debug string
const debug = debugFactory('example:debug:factory');

// Use it in your code
debug('Oops there was an error!');
```

To debug parts of your app with this custom debug string, you can run:

```sh
DEBUG=example:debug:factory npm start
```

> Refer to the [debug](https://www.npmjs.com/package/debug) documentation for
> more information.
