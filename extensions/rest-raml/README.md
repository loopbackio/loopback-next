# @loopback/rest-raml

A lightweight extension to convert the generated OpenAPI
specifications into RAML 1.0 and expose it via a binding and optionally via
the REST server.

## Stability: ⚠️Experimental⚠️

 > Experimental packages provide early access to advanced or experimental
 > functionality to get community feedback. Such modules are published to npm
 > using `0.x.y` versions. Their APIs and functionality may be subject to
 > breaking changes in future releases.

## Installation

```sh
$ [npm install | yarn add] @loopback/rest-raml
```

## Basic Use

Configure and load RestRamlComponent in the application constructor as
shown below.

```ts
import {RestRamlComponent} from '@loopback/rest-raml';
this.component(RestRamlComponent);
```

## Configuration

REST RAML leverages
[configuration by convention](https://loopback.io/doc/en/lb4/Context.html#configuration-by-convention)
and is able to generate.

```ts
app.configure()
```
