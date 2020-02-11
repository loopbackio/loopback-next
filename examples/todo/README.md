# @loopback/example-todo

In this feature branch, I am modifying the Todo application to show design-first
approach.

The first step is to run the original Todo app to obtain the OpenAPI spec
document, so that I don't have to write it myself.

```sh
$  curl http://127.0.0.1:3000/openapi.json > api.json
```

The next step is to configure the application to use the OpenAPI document.
(Note that at this point, the app won't start because of duplicate operations.)
