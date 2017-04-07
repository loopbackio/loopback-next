# LoopBack Test Lab

A collection of test utilities we use to write LoopBack tests.

## `expect`

[Should.js](https://shouldjs.github.io/) configured in "as-function" mode
(global `Object.protype` is left intact) with an extra chaining word `to`.

#### Example usage

```ts
import { expect } from '@loopback/testlab';

expect({key:'value'}).to.deepEqual({key: 'value'});
expect.exists(1);
```

## `sinon`

Spies, mocks and stubs. Learn more at [http://sinonjs.org/](http://sinonjs.org/).
