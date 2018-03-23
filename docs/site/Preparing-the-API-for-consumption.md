---
lang: en
title: 'Preparing the API for consumption'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Preparing-the-API-for-consumption.html
summary:
---

{% include previous.html content=" This article continues
from [Implementing features](./Implementing-features.md). " %}

## Preparing your API for consumption

### Interacting with your API

We'll use the repo
[loopback4-example-getting-started](https://github.com/strongloop/loopback4-example-getting-started)
to demonstrate how Swagger UI can be used to test your endpoints.

First, git clone the repository, install its dependencies, and run the
application:

```sh
git clone https://github.com/strongloop/loopback4-example-getting-started
cd loopback4-example-getting-started
npm i
npm start
```

Open <http://localhost:3000/swagger-ui> to see the API endpoints defined by
`swagger.json`.

{% include note.html content=" Swagger UI provides users with interactive
environment to test the API endpoints defined by the raw spec found at
<http://localhost:3000/openapi.json>. The API spec is also available in YAML
flavour at <http://localhost:3000/openapi.yaml> " %}

{% include image.html file="lb4/10000000.png" alt="" %}

The Swagger UI displays all of the endpoints defined in your application.

{% include image.html file="lb4/10000001.png" alt="" %}

Clicking on one of the endpoints will show the endpoint's documentation as
defined in your API spec. Next, click on `Try It Out` to send a request to the
endpoint. If the endpoint takes parameters, assign the values before the request
is sent. If the parameter involves a body, a template is given for you to edit
as specified in your spec. Click `Execute` to send the request:

{% include image.html file="lb4/10000002.png" alt="" %}

The response to the request can be seen below the `Execute` button, where the
response code and the body are displayed. Ideally, each endpoint should be
tested with good and bad inputs to confirm that the returned responses are as
expected.

## Closing thoughts

Congratulations! You now have successfully created and tested an API with
LoopBack 4. We hope you enjoy the test-drive. Your feedback matters and please
share your thoughts with us.

This is just the beginning of the full LoopBack 4 developer experience. The
first beta release lays out the new foundation of LoopBack for extension
developers. It also demonstrates a path to create REST APIs from OpenAPI specs
together with Controllers and Repositories. More features will be added in the
coming weeks and months.

Here is a sneak peek of what's coming:

- More extensions and extension points an:
  [loopback-next issue #512](https://github.com/strongloop/loopback-next/issues/512)

- Authorization component:
  [loopback-next issue #538](https://github.com/strongloop/loopback-next/issues/538)

- Fully-fledged API explorer:
  [loopback-next issue #559](https://github.com/strongloop/loopback-next/issues/559)

- Complete repository/service story for backend interactions

  - [loopback-next issue #419](https://github.com/strongloop/loopback-next/issues/419)
  - [loopback-next issue #537](https://github.com/strongloop/loopback-next/issues/537)
  - [loopback-next issue #522](https://github.com/strongloop/loopback-next/issues/522)

- Declarative support for various constructs

  - [loopback-next issue #441](https://github.com/strongloop/loopback-next/issues/441)
  - [loopback-next issue #461](https://github.com/strongloop/loopback-next/issues/461)

- Alignment of microservices and cloud native experience

  - [loopback-next issue #442](https://github.com/strongloop/loopback-next/issues/442)
  - [loopback-next issue #25](https://github.com/strongloop/loopback-next/issues/25)

- Tooling:
  [loopback-next issue #361](https://github.com/strongloop/loopback-next/issues/361)

- Plain JavaScript:
  [loopback-next issue #560](https://github.com/strongloop/loopback-next/issues/560)

The train is moving and welcome on board! Your participation and contribution
will make LoopBack 4 an even more powerful framework and greater
community/ecosystem. The team is very excited about the new journey. We look
forward to working with you on more ideas, more pull requests, and more
extension modules. Let's make LoopBack 4 rock together!
