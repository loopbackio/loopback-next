# @loopback/extension-metrics

This module contains a component that reports metrics of Node.js, LoopBack
framework, and your application to [Prometheus](https://prometheus.io/).

## Stability: :warning:Experimental:warning:

> Experimental packages provide early access to advanced or experimental
> functionality to get community feedback. Such modules are published to npm
> using `0.x.y` versions. Their APIs and functionality may be subject to
> breaking changes in future releases.

## Installation

```sh
npm install --save @loopback/extension-metrics
```

## Basic use

The component should be loaded in the constructor of your custom Application
class.

Start by importing the component class:

```ts
import {MetricsComponent} from '@loopback/extension-metrics';
```

In the constructor, add the component to your application:

```ts
this.component(MetricsComponent);
```

By default, Metrics route is mounted at `/metrics`. This path can be customized
via Metrics configuration as follows:

```ts
this.configure(MetricsBindings.COMPONENT).to({
  endpoint: {
    basePath: '/metrics',
  },
  defaultMetrics: {
    timeout: 5000,
  },
});
```

## Metrics Collected

There are three types of metrics being collected by this component:

1. Node.js metrics - built-in by https://github.com/siimon/prom-client
2. LoopBack method invocations - built-in by this module using an interceptor
3. Metrics by the application code or other modules - instrumentations are
   required

## Pull vs Push

Prometheus supports two modes to collect metrics:

- pull - scraping from metrics http endpoint exposed by the system being
  monitored
- push - pushing metrics from the system being monitored to a push gateway

See
https://prometheus.io/docs/introduction/faq/#why-do-you-pull-rather-than-push

## Try it out

```sh
git clone https://github.com/strongloop/loopback-next
npm install
npm run build
cd examples/metrics-prometheus
npm run demo
```

Open http://localhost:9090 to load Prometheus web UI.

### /metrics endpoint

http://localhost:3000/metrics returns metrics in plain text format. It includes
information for the Node.js process as well as LoopBack method invocations.

<details>
<summary>Example of plain text data</summary>
<pre>
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 0.132181 1564508354524
# HELP process_cpu_system_seconds_total Total system CPU time spent in seconds.
# TYPE process_cpu_system_seconds_total counter
process_cpu_system_seconds_total 0.023608999999999998 1564508354524
# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total 0.15578999999999998 1564508354524
# HELP process_start_time_seconds Start time of the process since unix epoch in seconds.
# TYPE process_start_time_seconds gauge
process_start_time_seconds 1564508343
# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes 61800448 1564508354524
# HELP nodejs_eventloop_lag_seconds Lag of event loop in seconds.
# TYPE nodejs_eventloop_lag_seconds gauge
nodejs_eventloop_lag_seconds 0.002172946 1564508354526
# HELP nodejs_active_handles Number of active libuv handles grouped by handle type. Every handle type is C++ class name.
# TYPE nodejs_active_handles gauge
nodejs_active_handles{type="WriteStream"} 2 1564508354524
nodejs_active_handles{type="Server"} 1 1564508354524
nodejs_active_handles{type="Socket"} 2 1564508354524
# HELP nodejs_active_handles_total Total number of active handles.
# TYPE nodejs_active_handles_total gauge
nodejs_active_handles_total 5 1564508354526
# HELP nodejs_active_requests Number of active libuv requests grouped by request type. Every request type is C++ class name.
# TYPE nodejs_active_requests gauge
# HELP nodejs_active_requests_total Total number of active requests.
# TYPE nodejs_active_requests_total gauge
nodejs_active_requests_total 0 1564508354526
# HELP nodejs_heap_size_total_bytes Process heap size from node.js in bytes.
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes 27545600 1564508354526
# HELP nodejs_heap_size_used_bytes Process heap size used from node.js in bytes.
# TYPE nodejs_heap_size_used_bytes gauge
nodejs_heap_size_used_bytes 23788272 1564508354526
# HELP nodejs_external_memory_bytes Nodejs external memory size in bytes.
# TYPE nodejs_external_memory_bytes gauge
nodejs_external_memory_bytes 1234918 1564508354526
# HELP nodejs_heap_space_size_total_bytes Process heap space size total from node.js in bytes.
# TYPE nodejs_heap_space_size_total_bytes gauge
nodejs_heap_space_size_total_bytes{space="read_only"} 524288 1564508354526
nodejs_heap_space_size_total_bytes{space="new"} 1048576 1564508354526
nodejs_heap_space_size_total_bytes{space="old"} 16900096 1564508354526
nodejs_heap_space_size_total_bytes{space="code"} 688128 1564508354526
nodejs_heap_space_size_total_bytes{space="map"} 1576960 1564508354526
nodejs_heap_space_size_total_bytes{space="large_object"} 6758400 1564508354526
nodejs_heap_space_size_total_bytes{space="code_large_object"} 49152 1564508354526
nodejs_heap_space_size_total_bytes{space="new_large_object"} 0 1564508354526
# HELP nodejs_heap_space_size_used_bytes Process heap space size used from node.js in bytes.
# TYPE nodejs_heap_space_size_used_bytes gauge
nodejs_heap_space_size_used_bytes{space="read_only"} 31712 1564508354526
nodejs_heap_space_size_used_bytes{space="new"} 9584 1564508354526
nodejs_heap_space_size_used_bytes{space="old"} 15723128 1564508354526
nodejs_heap_space_size_used_bytes{space="code"} 377600 1564508354526
nodejs_heap_space_size_used_bytes{space="map"} 918480 1564508354526
nodejs_heap_space_size_used_bytes{space="large_object"} 6726408 1564508354526
nodejs_heap_space_size_used_bytes{space="code_large_object"} 3456 1564508354526
nodejs_heap_space_size_used_bytes{space="new_large_object"} 0 1564508354526
# HELP nodejs_heap_space_size_available_bytes Process heap space size available from node.js in bytes.
# TYPE nodejs_heap_space_size_available_bytes gauge
nodejs_heap_space_size_available_bytes{space="read_only"} 492264 1564508354526
nodejs_heap_space_size_available_bytes{space="new"} 1038368 1564508354526
nodejs_heap_space_size_available_bytes{space="old"} 1105240 1564508354526
nodejs_heap_space_size_available_bytes{space="code"} 285952 1564508354526
nodejs_heap_space_size_available_bytes{space="map"} 657072 1564508354526
nodejs_heap_space_size_available_bytes{space="large_object"} 0 1564508354526
nodejs_heap_space_size_available_bytes{space="code_large_object"} 0 1564508354526
nodejs_heap_space_size_available_bytes{space="new_large_object"} 1047952 1564508354526
# HELP nodejs_version_info Node.js version info.
# TYPE nodejs_version_info gauge
nodejs_version_info{version="v12.4.0",major="12",minor="4",patch="0"} 1
# HELP loopback_invocation_duration_seconds method invocation
# TYPE loopback_invocation_duration_seconds gauge
# HELP loopback_invocation_duration_histogram method invocation histogram
# TYPE loopback_invocation_duration_histogram histogram
# HELP loopback_invocation_total method invocation counts
# TYPE loopback_invocation_total counter
loopback_invocation_total 1
# HELP loopback_invocation_duration_summary method invocation summary
# TYPE loopback_invocation_duration_summary summary
</pre>

</details>

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
