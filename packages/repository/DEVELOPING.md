## LB4 vs. LB3

### How LoopBack 4 creates/handles models. [2019 July 24]

In `lb4`, we introduce the concept of
[`repository`](https://loopback.io/doc/en/lb4/Repositories.html). In order to
implement this new feature `repository`, we are using legacy juggler bridge as a
(temporary) solution. Each model has two **parallel classes**:

- The class defined by the app developers using decorators and
  `class MyModel extends Entity` syntax.
- The "implementation" class created by legacy-juggler-bridge, this class is
  inheriting from juggler's Model `base class`.

If you take a deep look into it, you would find that LB4 model handles some data
before it hands the model to Juggler. That's why `lb4` has some differences
compared to `lb3` when generating models.

For example, you might notice that some entries in `@model` decorator are not
available/supported by lb4 even they both run the same lines of code in Juggler.
For instance, the default values for the `strict` entry in `@model decorator`
are different:

|           | [in LB3](https://loopback.io/doc/en/lb3/Model-definition-JSON-file.html#top-level-properties)                                                     | [in LB4](https://loopback.io/doc/en/lb4/Model.html#model-decorator)                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | `false`                                                                                                                                           | `true`                                                                                                                                                                       |
| code      | [defined here](https://github.com/strongloop/loopback-datasource-juggler/blob/2b8c1ebaeec3d8be87da38236db3d8210bca6230/lib/model-builder.js#L130) | [defined here](https://github.com/strongloop/loopback-next/blob/ba3f3894ef7e102b0fcd8b9b7a1f1d221bbbf4a4/packages/repository/src/repositories/legacy-juggler-bridge.ts#L160) |

Hope this example shows the idea that even they both use the `base model` from
Juggler, LB4 model doesn't use, or even have access to some fields/entries in
the Juggler model!

As mentioned before, we are using the legacy juggler bridge as a temporary
solution. This may change in the future since the Juggler is pretty.. you know,
legacy. However, it's important to realize how LB4 deals with models.

Happy coding :D
