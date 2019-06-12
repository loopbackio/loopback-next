# @loopback/rest-explorer

This module contains a component adding a self-hosted REST API Explorer to
LoopBack applications.

## Installation

```sh
npm install --save @loopback/rest-explorer
```

## Basic use

The component should be loaded in the constructor of your custom Application
class. Applications scaffolded by recent versions of our `lb4` CLI tool have the
self-hosted REST API Explorer pre-configured out of the box.

Start by importing the component class:

```ts
import {RestExplorerComponent} from '@loopback/rest-explorer';
```

In the constructor, add the component to your application:

```ts
this.component(RestExplorerComponent);
```

By default, API Explorer is mounted at `/explorer`. This path can be customized
via RestExplorer configuration as follows:

```ts
this.configure(RestExplorerBindings.COMPONENT).to({
  path: '/openapi/ui',
});
```

Or:

```ts
this.bind(RestExplorerBindings.CONFIG).to({
  path: '/openapi/ui',
});
```

_NOTE: The Explorer UI's visual style is not customizable yet. Our recommended
solution is to create a fork of this module, make any style changes in the fork
and publish the modified module under a different name. The
[GitHub issue #2023](https://github.com/strongloop/loopback-next/issues/2023) is
requesting a configuration option for customizing the visual style, please
up-vote the issue and/or join the discussion if you are interested in this
feature._

### Advanced Configuration and Reverse Proxies

By default, the component will add an additional OpenAPI spec endpoint, in the
format it needs, at a fixed relative path to that of the Explorer itself. For
example, in the default configuration, it will expose `/explorer/openapi.json`,
or in the examples above with the Explorer path configured, it would expose
`/openapi/ui/openapi.json`. This is to allow it to use a fixed relative path to
load the spec, to be tolerant of running behind reverse proxies.

You may turn off this behavior in the component configuration, for example:

```ts
this.configure(RestExplorerBindings.COMPONENT).to({
  useSelfHostedSpec: false,
});
```

If you do so, it will try to locate an existing configured OpenAPI spec endpoint
of the required form in the REST Server configuration. This may be problematic
when operating behind a reverse proxy that inserts a path prefix.

When operating behind a reverse proxy that does path changes, such as inserting
a prefix on the path, using the default behavior for `useSelfHostedSpec` is the
simplest option, but is not sufficient to have a functioning Explorer. You will
also need to explicitly configure `rest.openApiSpec.servers` (in your
application configuration object) to have an entry that has the correct host and
path as seen by the _client_ browser.

Note that in this scenario, setting `rest.openApiSpec.setServersFromRequest` is
not recommended, as it will cause the path information to be lost, as the
standards for HTTP reverse proxies only provide means to tell the proxied server
(your app) about the _hostname_ used for the original request, not the full
original _path_.

Note also that you cannot use a url-relative path for the `servers` entry, as
the Swagger UI does not support that (yet). You may use a _host_-relative path
however.

#### Summary

For some common scenarios, here are recommended configurations to have the
explorer working properly. Note that these are not the _only_ configurations
that will work reliably, they are just the _simplest_ ones to setup.

| Scenario                                                                            | `useSelfHostedSpec` | `setServersFromRequest`                | `servers`                                                        |
| ----------------------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| App exposed directly                                                                | yes                 | either                                 | automatic                                                        |
| App behind simple reverse proxy                                                     | yes                 | yes                                    | automatic                                                        |
| App exposed directly or behind simple proxy, with a `basePath` set                  | yes                 | yes                                    | automatic                                                        |
| App exposed directly or behind simple proxy, mounted inside another express app     | yes                 | yes                                    | automatic                                                        |
| App behind path-modifying reverse proxy, modifications known to app<sup>1</sup>     | yes                 | no                                     | configure manually as host-relative path, as clients will see it |
| App behind path-modifying reverse proxy, modifications not known to app<sup>2</sup> | ?                   | ?                                      | ?                                                                |
| App uses custom OpenAPI spec instead of LB4-generated one                           | no                  | depends on reverse-proxy configuration | depends on reverse-proxy configuration                           |

<sup>1</sup> The modifications need to be known to the app at build or startup
time so that you can manually configure the `servers` list. For example, if you
know that your reverse proxy is going to expose the root of your app at
`/foo/bar/`, then you would set the first of your `servers` entries to
`/foo/bar`. This scenario also cases where the app is using a `basePath` or is
mounted inside another express app, with this same reverse proxy setup. In those
cases the manually configured `servers` entry will need to account for the path
prefixes the `basePath` or express embedding adds in addition to what the
reverse proxy does.

<sup>2</sup> Due to limitations in the OpenAPI spec and what information is
provided by the reverse proxy to the app, this is a scenario without a clear
standards-based means of getting a working explorer. A custom solution would be
needed in this situation, such as passing a non-standard header from your
reverse proxy to tell the app the external path, and custom code in your app to
make the app and explorer aware of this.

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
