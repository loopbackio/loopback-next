# @loopback/health

This module contains a component to report health status using
[@cloudnative/health](https://github.com/CloudNativeJS/cloud-health).

## Installation

```sh
npm install --save @loopback/health
```

## Basic use

{% include note.html content="*this.configure()* must be called before *this.component()* to take effect. This is a [known limitation](https://github.com/strongloop/loopback-next/issues/4289#issuecomment-564617263)." %}

The component should be loaded in the constructor of your custom Application
class.

Start by importing the component class:

```ts
import {HealthComponent} from '@loopback/health';
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

_Liveness probes_ are used to know when to restart a container. For example, in
case of a deadlock due to a multi-threading defect which might not crash the
container but keep the application unresponsive. A custom liveness probe would
detect this failure and restart the container.

_Readiness probes_ are used to decide when the container is available for
accepting traffic. It is important to note, that readiness probes are
periodically checked and not only at startup.

**Important:** It is recommended to avoid checking dependencies in liveness
probes. Liveness probes should be inexpensive and have response times with
minimal variance.

```ts
import {LiveCheck, ReadyCheck, HealthTags} from '@loopback/health';

const myLiveCheck: LiveCheck = () => {
  return Promise.resolve();
};
app.bind('health.MyLiveCheck').to(myLiveCheck).tag(HealthTags.LIVE_CHECK);

// Define a provider to check the health of a datasource
class DBHealthCheckProvider implements Provider<ReadyCheck> {
  constructor(@inject('datasources.db') private ds: DataSource) {}

  value() {
    return () => this.ds.ping();
  }
}

app
  .bind('health.MyDBCheck')
  .toProvider(DBHealthCheckProvider)
  .tag(HealthTags.READY_CHECK);

const myReadyCheck: ReadyCheck = () => {
  return Promise.resolve();
};
app.bind('health.MyReadyCheck').to(myReadyCheck).tag(HealthTags.READY_CHECK);
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
