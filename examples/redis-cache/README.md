# Redis Cache Example for Loopback 4

## Install dependencies

```sh
npm install
```

## Run Postgres and Redis instance

```sh
docker-compose up
```

## Run the application

```sh
npm start
```

Open http://127.0.0.1:3000 in your browser.

# How to add cache

### Following the guide from [loopback-api-cache](https://github.com/alfonsocj/loopback-api-cache/#loopback-api-cache)

<br>

## Installation

```sh
npm install --save loopback-api-cache
```

## How to use it

Start by creating a Model for the cache. It should have `id: string`,
`data: any` and `ttl: number` fields.

```sh
lb4 model
```

```sh
? Model class name: cache
? Please select the model base class (Use arrow keys)
❯ Entity (A persisted model with an ID)
? Allow additional (free-form) properties? (y/N) No

? Enter the property name: id
? Property type: (Use arrow keys)
❯ string
? Is id the ID property? (y/N) Yes
? Is it required?: Yes
? Default value [leave blank for none]:

...
```

At the end you would have something like

```ts
// src/models/cache.model.ts
import {Entity, model, property} from '@loopback/repository';

@model()
export class Cache extends Entity {
  @property({
    type: 'number',
    id: true,
    required: true,
  })
  id: number;

  @property({
    type: 'any',
    required: true,
  })
  data: any;

  @property({
    type: 'number',
    required: true,
  })
  ttl: number;

  constructor(data?: Partial<Cache>) {
    super(data);
  }
}
```

Now create the cache datasource and repository of your choice. We are going to
be using Redis for this example.

```sh
lb4 datasource
? Datasource name: cache
? Select the connector for cache:
❯ Redis key-value connector (supported by StrongLoop)
...
```

```sh
lb4 repository
❯ CacheDatasource
? Select the model(s) you want to generate a repository
❯◉ Cache
...
```

Decorate your controller methods with `@cache(ttl)` to be able to cache the
response.

```ts
// src/controllers/product.controller.ts
import {repository} from '@loopback/repository';
import {get, param} from '@loopback/rest';
import {cache} from 'loopback-api-cache';
import {ProductRepository} from '../repositories';

export class ProductController {
  constructor(
    @repository(ProductRepository)
    public productRepository: ProductRepository,
  ) {}

  // caching response for 60 seconds
  @cache(60)
  @get('/products/{id}')
  async findById(@param.path.number('id') id: number): Promise<Product> {
    return this.productRepository.findById(id);
  }
}
```

Next, implement a cache strategy provider. It can contain any custom cache set
and get logic. One use case is to instead of storing a list of products as one
key, you can create separate keys against each product id.

```ts
// src/providers/cache-strategy.provider.ts
import {inject, Provider, ValueOrPromise} from '@loopback/core';
import {repository} from '@loopback/repository';
import {CacheBindings, CacheMetadata, CacheStrategy} from 'loopback-api-cache';
import {CacheRepository} from '../repositories';

export class CacheStrategyProvider
  implements Provider<CacheStrategy | undefined>
{
  constructor(
    @inject(CacheBindings.METADATA)
    private metadata: CacheMetadata,
    @repository(CacheRepository) protected cacheRepo: CacheRepository,
  ) {}

  value(): ValueOrPromise<CacheStrategy | undefined> {
    if (!this.metadata) {
      return undefined;
    }

    return {
      check: (path: string) =>
        this.cacheRepo.get(path).catch(err => {
          console.error(err);
          return undefined;
        }),
      set: async (path: string, result: any) => {
        const cache = new Cache({
          id: result.id,
          data: result,
          ttl: this.metadata.ttl,
        });
        this.cacheRepo.set(path, cache, {ttl: ttlInMs}).catch(err => {
          console.error(err);
        });
      },
    };
  }
}
```

In order to perform the check and set of our cache, we need to implement a
custom Sequence invoking the corresponding methods at the right time during the
request handling.

```ts
// src/sequence.ts
import {inject} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {CacheBindings, CacheCheckFn, CacheSetFn} from 'loopback-api-cache';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(CacheBindings.CACHE_CHECK_ACTION)
    protected checkCache: CacheCheckFn,
    @inject(CacheBindings.CACHE_SET_ACTION) protected setCache: CacheSetFn,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);

      // Important part added to check for cache and respond with that if found
      const cache = await this.checkCache(request);
      if (cache) {
        this.send(response, cache.data);
        return;
      }

      const result = await this.invoke(route, args);
      this.send(response, result);

      // Important part added to set cache with the result
      this.setCache(request, result);
    } catch (error) {
      this.reject(context, error);
    }
  }
}
```

Don't forget to inject `CacheBindings.CACHE_CHECK_ACTION` and
`CacheBindings.CACHE_SET_ACTION`

```diff
+ @inject(CacheBindings.CACHE_CHECK_ACTION) protected checkCache: CacheCheckFn,
+ @inject(CacheBindings.CACHE_SET_ACTION) protected setCache: CacheSetFn,
```

Finally, put it all together in your application class:

```ts
// src/application.ts
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication, RestBindings, RestServer} from '@loopback/rest';
import {CacheBindings, CacheComponent} from 'loopback-api-cache';
import {MySequence} from './sequence';

export class MyApp extends BootMixin(RestApplication) {
  constructor(options?: ApplicationConfig) {
    super(options);

    this.projectRoot = __dirname;

    // Add these two lines to your App
    this.component(CacheComponent);
    this.bind(CacheBindings.CACHE_STRATEGY).toProvider(CacheStrategyProvider);

    this.sequence(MySequence);
  }

  async start() {
    await super.start();

    const server = await this.getServer(RestServer);
    const port = await server.get(RestBindings.PORT);
    console.log(`REST server running on port: ${port}`);
  }
}
```
