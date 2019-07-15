# @loopback/extension-health

This module contains a component to report health status using
[@cloudnative/health](https://github.com/CloudNativeJS/cloud-health).

## Installation

```sh
npm install --save @loopback/extension-health
```

## Basic use

The component should be loaded in the constructor of your custom Application
class.

Start by importing the component class:

```ts
import {HealthComponent} from '@loopback/extension-health';
```

In the constructor, add the component to your application:

```ts
this.component(HealthComponent);
```

By default, three routes are exposed at:

- `/health` - overall health status
- `/live` - liveness status
- `/ready` - readiness status

The paths can be customized via Health configuration as follows:

```ts
this.configure(HealthBindings.COMPONENT).to({
  healthPath: '/health',
  livePath: '/live',
  readyPath: '/ready',
});
```

http://localhost:3000/health returns health in JSON format, such as:

```json
{
  "status": "UP",
  "checks": [
    {"name": "readiness", "state": "UP", "data": {"reason": ""}},
    {"name": "liveness", "state": "UP", "data": {"reason": ""}}
  ]
}
```

## Add custom `live` and `ready` checks

The health component allows extra
[`live` and `ready` checks](https://github.com/CloudNativeJS/cloud-health#readiness-vs-liveness)
to be added.

```ts
import {LiveCheck, ReadyCheck, HealthTags} from '@loopback/extension-health';

const myLiveCheck: LiveCheck = () => {
  return Promise.resolve();
};
app
  .bind('health.MyLiveCheck')
  .to(myLiveCheck)
  .tag(HealthTags.LIVE_CHECK);

// Define a provider to check the liveness of a datasource
class DBLiveCheckProvider implements Provider<LiveCheck> {
  constructor(@inject('datasources.db') private ds: DataSource) {}

  value() {
    return () => this.ds.ping();
  }
}

app
  .bind('health.MyDBCheck')
  .toProvider(DBLiveCheckProvider)
  .tag(HealthTags.LIVE_CHECK);

const myReadyCheck: ReadyCheck = () => {
  return Promise.resolve();
};
app
  .bind('health.MyReadyCheck')
  .to(myReadyCheck)
  .tag(HealthTags.READY_CHECK);
```

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
