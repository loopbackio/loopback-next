# @loopback/boot

Boot package for LoopBack 4 to bootstrap convention based projects.

## Overview

This package provides the ability to bootstrap a LoopBack 4 project by
automatically automatically associating artifacts and configuration with an
application at runtime.

The package is currently consumed as a [Mixin](http://loopback.io/doc/en/lb4/Mixin.html).

It will automatically find all [Controller](http://loopback.io/doc/en/lb4/Controllers.html)
classes by searching through all files in `controllers` directory ending in 
`.controller.js` and bind them to the application using `this.controller()`.

Other Mixins can support automatic Booting by overriding the `boot()` method.
See example in [Advanced use](#advanced-use).

## Installation

```sh
npm i --save @loopback/boot
```

## Basic use

Using `@loopback/boot` is simple. It is a Mixin and should be added to your
application Class as shown below.

```ts
class BootedApplication extends BootMixin(Application) {
  constructor(options?: ApplicationConfig) {
    super(options);
  }
}
```

### Configuration

Configuration options for boot can be set via the `ApplicationConfig` object 
(`options`). The following options are supported:

|Name|Default|Description|
|-|-|-|
|`boot.rootDir`|`process.cwd()`|The root directory for the project. All other paths are resolved relative to this path.|
|`boot.controllerDirs`|`controllers`|String or Array of directory paths to search in for controllers. Paths may be relative to `rootDir` or absolute.|
|`boot.controllerExts`|`controller.js`|String or Array of file extensions to consider as controller files.|

*Example*
```ts
app = new BootedApplication({
  rest: {
    port: 3000
  },
  boot: {
    rootDir: '/absolute/path/to/my/app/root',
    controllerDirs: ['controllers', 'ctrls'],
    controllerExts: ['controller.js', '.ctrl.js'],
  },
});

## Advanced use

An extension developer can support the **boot** process by writing a mixin and
overriding the `boot()` function as shown below. If a user is using
`@loopback/boot`, it will automatically boot your artifact as well.

```ts
function TestMixin<T extends Constructor<any>>(superClass: T) {
  return class extends superClass {
    constructor(...args: any[]) {
      super(...args);
    }

    async boot() {
      // Your custom config
      const repoDir = this.options.boot.repoDir || 'repositories';
      // We call the convenience method to boot class artifacts
      await this.bootClassArtifacts(repoDir, 'repository.js', 'testMixinRepo');

      // IMPORTANT: This line must be added so all other artifacts can be booted
      // automatically and regardless of the order of the Mixins.
      if (super.boot) await super.boot();
    }
  };
}
```

## Related resources

**Coming Soon** Link to Boot Docs.

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing#guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

run `npm test` from the root folder.

## Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
