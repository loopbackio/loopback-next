---
lang: en
title: 'Putting it all together'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-tutorial-putting-it-together.html
summary: LoopBack 4 Todo Application Tutorial - Putting it all together
---

### Putting it all together

We've got all of our artifacts now, and they are all automatically bound to our
[Application](../../Application.md) so that LoopBack's
[Dependency injection](../../Dependency-injection.md) system can tie it all
together for us!

LoopBack's
[boot module](https://github.com/strongloop/loopback-next/tree/master/packages/boot)
will automatically discover our controllers, repositories, datasources and other
artifacts and inject them into our application for use.

> **NOTE**: The boot module will discover and inject artifacts that follow our
> established conventions for artifact directories. Here are some examples:
>
> - Controllers: `./src/controllers`
> - Datasources: `./src/datasources`
> - Models: `./src/models`
> - Repositories: `./src/repositories`
>
> To find out how to customize this behavior, see the
> [Booters](../../Booting-an-Application.md#booters) section of
> [Booting an Application](../../Booting-an-Application.md).

Let's try out our application! First, you'll want to start the app.

```sh
$ npm start

Server is running at http://127.0.0.1:3000
```

Next, you can use the [API Explorer](http://localhost:3000/explorer) to browse
your API and make requests!

Here are some requests you can try:

- `POST /todos` with a body of `{ "title": "get the milk" }`
- `GET /todos/{id}` using the ID you received from your `POST`, and see if you
  get your Todo object back.
- `PATCH /todos/{id}`, using the same ID, with a body of
  `{ "desc": "need milk for cereal" }`

That's it! You've just created your first LoopBack 4 application!

### Where to go from here

There are still a ton of features you can use to build on top of the
`TodoListApplication`. Here are some tutorials that continues off from where we
left off here to guide you through adding in an additional feature:

- **Integrate with a REST based geo-coding service**: A typical REST API server
  needs to access data from a variety of sources, including SOAP or REST
  services. Continue to the bonus section to learn how LoopBack connectors make
  it super easy to fetch data from other services and
  [enhance your Todo application with location-based reminders](todo-tutorial-geocoding-service.md).
- **Add related Model with TodoListApplication**: If you would like to try out
  using some of the more advanced features of LoopBack 4 such as relations, try
  out the
  [TodoList tutorial](https://loopback.io/doc/en/lb4/todo-list-tutorial.html)
  which continues off from where we leave here.

### More examples and tutorials

Eager to continue learning about LoopBack 4? Check out our
[Examples](../../Examples.md) and [Tutorials](../../Tutorials.md) sections to
find examples for creating your own custom components, sequences and more!

### Navigation

Previous step: [Add a controller](todo-tutorial-controller.md)
