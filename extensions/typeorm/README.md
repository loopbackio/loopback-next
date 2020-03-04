# @loopback/typeorm

This module contains a component to provide integration with
[TypeORM](https://typeorm.io/).

## Installation

```sh
npm install --save @loopback/typeorm
```

## Basic use

{% include note.html content="*this.configure()* must be called before *this.component()* to take effect. This is a [known limitation](https://github.com/strongloop/loopback-next/issues/4289#issuecomment-564617263)." %}

The component should be loaded in the constructor of your custom Application
class.

Start by importing the component class:

```ts
import {TypeOrmComponent} from '@loopback/typeorm';
```

In the constructor, add the component to your application:

```ts
this.component(TypeOrmComponent);
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
