# @loopback/example-todo-list

This is an extended tutorial that builds on top of `@loopback/example-todo`.

## Overview

This tutorial demonstrates how to create a set of APIs for models that are
related to one another.

![todo-tutorial-overview](https://loopback.io/pages/en/lb4/imgs/todo-list-overview.png)

## Setup

If you're following from the tutorial in `@loopback/example-todo`, you can jump
straight to our first step:
[Add TodoList model](http://loopback.io/doc/en/lb4/todo-list-tutorial-model.html)

If not, you'll need to make sure you have a couple of things installed before we
get started:

- [Node.js](https://nodejs.org/en/) at v8.9 or greater

Next, you'll need to install the LoopBack 4 CLI toolkit:

```sh
npm i -g @loopback/cli
```

We recommend that you start with the
[todo tutorial](http://loopback.io/doc/en/lb4/todo-tutorial.html) if you're not
familiar with LoopBack4, but if you are and don't want to start from scratch
again, you can use the LoopBack 4 CLI tool to catch up to where this tutorial
will continue from:

```sh
lb4 example todo-list
```

It should be noted that this tutorial does not assume the
[optional geo-coding step](https://loopback.io/doc/en/lb4/todo-tutorial-geocoding-service.html)
has been completed. Whether the step has been completed or not, the content and
the steps listed in this tutorial remain the same.

## Tutorial

Once you're ready to start the tutorial, let's begin by
[adding a TodoList model](http://loopback.io/doc/en/lb4/todo-list-tutorial-model.html)

### Steps

1.  [Add TodoList Model](http://loopback.io/doc/en/lb4/todo-list-tutorial-model.html)
2.  [Add TodoList Repository](http://loopback.io/doc/en/lb4/todo-list-tutorial-repository.html)
3.  [Add TodoList and TodoList's Todo Controller](http://loopback.io/doc/en/lb4/todo-list-tutorial-controller.html)

## Try it out

If you'd like to see the final results of this tutorial as an example
application, follow these steps:

1.  Run the `lb4 example` command to select and clone the todo repository:

    ```sh
    lb4 example todo-list
    ```

2.  Switch to the directory.

    ```sh
    cd loopback4-example-todo-list
    ```

3.  Finally, start the application!

    ```sh
    $ npm start

    Server is running at http://127.0.0.1:3000
    ```

Feel free to look around in the application's code to get a feel for how it
works. If you're interested in how it's been built or why we do things a certain
way, then continue on with this tutorial!

### Bugs/Feedback

Open an issue in [loopback-next](https://github.com/strongloop/loopback-next)
and we'll take a look!

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
