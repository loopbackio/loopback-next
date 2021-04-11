# @loopback/waterline

[![LoopBack](https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

## Installation

Install LoopbackWaterlineComponent using `npm`;

```sh
$ [npm install | yarn add] @loopback/waterline
```

## Basic Use

Configure and load LoopbackWaterlineComponent in the application constructor
as shown below.

```ts
import {LoopbackWaterlineComponent, LoopbackWaterlineComponentOptions, DEFAULT__LOOPBACK_WATERLINE_OPTIONS} from '@loopback/waterline';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    const opts: LoopbackWaterlineComponentOptions = DEFAULT__LOOPBACK_WATERLINE_OPTIONS;
    this.configure(LoopbackWaterlineComponentBindings.COMPONENT).to(opts);
      // Put the configuration options here
    });
    this.component(LoopbackWaterlineComponent);
    // ...
  }
  // ...
}
```
