# Summary

https://12factor.net/

> I. Codebase One codebase tracked in revision control, many deploys

We're using github.

> II. Dependencies Explicitly declare and isolate dependencies

We use dependency injection.

> III. Config Store config in the environment

Context-based configuration and pluggable configuration resolver.

> IV. Backing services Treat backing services as attached resources

Services/DataSources/...

> V. Build, release, run Strictly separate build and run stages

npm scripts

> VI. Processes Execute the app as one or more stateless processes

Stateless Docker container

> VII. Port binding Export services via port binding

HTTP/HTTPS server via configuration

> VIII. Concurrency Scale out via the process model

> IX. Disposability Maximize robustness with fast startup and graceful shutdown

Life cycle events and observers

> X. Dev/prod parity Keep development, staging, and production as similar as
> possible

> XI. Logs Treat logs as event streams

> XII. Admin processes Run admin/management tasks as one-off processes
