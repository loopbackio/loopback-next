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
