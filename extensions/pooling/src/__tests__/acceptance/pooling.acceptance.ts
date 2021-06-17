// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/pooling
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingKey,
  Constructor,
  Context,
  ContextTags,
  createBindingFromClass,
  inject,
  Provider,
} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {once} from 'events';
import {Options} from 'generic-pool';
import {
  createPooledBindingFactory,
  PoolingService,
  PoolingServiceOptions,
} from '../../';
import {
  getPooledValue,
  Poolable,
  PooledValue,
  PoolFactory,
} from '../../pooling';

describe('Resource pool', () => {
  const POOLING_SERVICE =
    BindingKey.create<PoolingService<ExpensiveResource>>('services.pooling');
  let ctx: Context;

  beforeEach(givenContext);

  beforeEach('Reset resource id', () => {
    ExpensiveResource.id = 1;
  });

  it('creates a resource pool', async () => {
    const poolService = await givenPoolService();
    expect(poolService.pool.size).to.eql(0);
  });

  it('creates a resource pool as singleton', async () => {
    const poolService = await givenPoolService();
    const result = await ctx.get(POOLING_SERVICE);
    expect(result).to.be.exactly(poolService);
  });

  it('acquires/releases a resource from the pool', async () => {
    const poolService = await givenPoolService();
    poolService.start();
    const res = await poolService.acquire();
    expect(res.status).to.eql('created');
    expect(poolService.pool.borrowed).to.eql(1);
    await poolService.release(res);
    expect(poolService.pool.borrowed).to.eql(0);
  });

  it('runs a task', async () => {
    const poolService = await givenPoolService();
    await poolService.run(resource => {
      resource.status = 'running';
    });
    expect(poolService.pool.borrowed).to.eql(0);
  });

  it('runs a task that throws an error', async () => {
    const poolService = await givenPoolService();
    let acquired: ExpensiveResource;
    await expect(
      poolService.run(resource => {
        acquired = resource;
        throw new Error('fail');
      }),
    ).to.be.rejectedWith(/fail/);
    expect(acquired!).to.be.instanceOf(ExpensiveResource);
    expect(poolService.pool.borrowed).to.eql(0);
    expect(acquired!.status).to.eql('destroyed');
    expect(poolService.pool.isBorrowedResource(acquired!)).to.be.false();
  });

  it('honors poolOptions.min', async () => {
    const poolService = await givenPoolService({min: 2, max: 5});
    expect(poolService.pool.size).to.eql(0);
    poolService.start();
    const res = await poolService.acquire();
    expect(res.status).to.eql('created');
    expect(poolService.pool.available).to.eql(1);
    expect(poolService.pool.borrowed).to.eql(1);
    expect(poolService.pool.size).to.eql(2);
    await poolService.release(res);
    expect(poolService.pool.available).to.eql(2);
    expect(poolService.pool.borrowed).to.eql(0);
    expect(poolService.pool.size).to.eql(2);
  });

  it('honors poolOptions.max', async () => {
    const poolService = await givenPoolService({
      min: 1,
      max: 2,
      acquireTimeoutMillis: 100,
    });
    // 1st
    const res1 = await poolService.acquire();
    expect(poolService.pool.borrowed).to.eql(1);
    // 2nd
    await poolService.acquire();
    expect(poolService.pool.available).to.eql(0);
    expect(poolService.pool.borrowed).to.eql(2);
    expect(poolService.pool.size).to.eql(2);
    // 3rd has to wait
    await expect(poolService.acquire()).to.be.rejectedWith(
      /ResourceRequest timed out/,
    );
    await poolService.release(res1);
    expect(poolService.pool.available).to.eql(1);
    await poolService.acquire();
    expect(poolService.pool.available).to.eql(0);
    expect(poolService.pool.borrowed).to.eql(2);
    expect(poolService.pool.size).to.eql(2);
  });

  it('destroys a resource from the pool', async () => {
    const poolService = await givenPoolService();
    const res = await poolService.acquire();
    expect(res.status).to.eql('created');
    await poolService.release(res);
    expect(res.status).to.eql('created');
    await poolService.stop();
    expect(res.status).to.eql('destroyed');
  });

  it('validates a resource during acquire', async () => {
    const poolService = await givenPoolService({
      testOnBorrow: true,
    });
    const res = await poolService.acquire();
    expect(res.status).to.eql('validated');
  });

  it('fails a resource during acquire', async () => {
    const poolService = await givenPoolService(
      {
        testOnBorrow: true,
      },
      ExpensiveResource,
      'invalid',
    );
    const res = await poolService.acquire();
    expect(res.status).to.eql('validated');
    // The first creation fails and generic-pool calls `create` again
    expect(res.id).to.eql(2);
  });

  it('validates a resource during release', async () => {
    const poolService = await givenPoolService({
      testOnReturn: true,
    });
    const res = await poolService.acquire();
    expect(res.status).to.eql('created');
    res.status = 'invalid';
    await poolService.release(res);
    expect(poolService.pool.isBorrowedResource(res)).to.be.false();
  });

  it('invokes resource-level acquire/release methods', async () => {
    const poolService = await givenPoolService({}, ExpensiveResourceWithHooks);
    poolService.start();
    const reqCtx = new Context('request');
    const res = (await poolService.acquire(
      reqCtx,
    )) as ExpensiveResourceWithHooks;
    expect(res.status).to.eql('in-use');
    expect(res.requestCtx).to.eql(reqCtx);
    await poolService.release(res);
    expect(res.status).to.eql('idle');
    expect(res.requestCtx).to.be.undefined();
  });

  it('invokes factory-level acquire/release methods', async () => {
    setupPoolingService({}, ExpensiveResourceWithHooks);
    const factory = (await ctx.getConfig<
      PoolingServiceOptions<ExpensiveResource>
    >(POOLING_SERVICE))!.factory as PoolFactory<ExpensiveResource>;
    factory.acquire = (resource: ExpensiveResource) => {
      resource.status = 'in-use-set-by-factory';
    };
    factory.release = (resource: ExpensiveResource) => {
      resource.status = 'idle-set-by-factory';
    };
    const poolService = await ctx.get(POOLING_SERVICE);
    poolService.start();
    const res = await poolService.acquire();
    expect(res.status).to.eql('in-use-set-by-factory');
    await poolService.release(res);
    expect(res.status).to.eql('idle-set-by-factory');
  });

  it('supports pooled binding factory', async () => {
    const poolService = await givenPoolServiceForBinding();
    const res = await poolService.acquire();
    expect(res.toJSON()).to.eql({status: 'started', id: 1});
    await poolService.release(res);
    expect(res.toJSON()).to.eql({status: 'started', id: 1});
    await poolService.stop();
    expect(res.toJSON()).to.eql({status: 'stopped', id: 1});
  });

  it('releases pooled binding on context.close', async () => {
    const poolService = await givenPoolServiceForBinding();
    const reqCtx = new Context(ctx, 'req');
    const res = await poolService.acquire();
    reqCtx.once('close', () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      poolService.release(res);
    });
    const requestClosed = once(reqCtx, 'close');
    reqCtx.close();
    reqCtx.emit('close');
    await requestClosed;
    expect(poolService.pool.isBorrowedResource(res)).to.be.false();
  });

  it('allows injection of pooling service', async () => {
    await givenPoolService();
    ctx
      .bind('resources.ExpensiveResource')
      .toProvider(ExpensiveResourceProvider);
    const res1: PooledValue<ExpensiveResource> = await ctx.get(
      'resources.ExpensiveResource',
    );
    expect(res1.value.toJSON()).to.eql({status: 'created', id: 1});
    const res2: PooledValue<ExpensiveResource> = await ctx.get(
      'resources.ExpensiveResource',
    );
    expect(res2.value.toJSON()).to.eql({status: 'created', id: 2});
    await res1.release();
    const res3: PooledValue<ExpensiveResource> = await ctx.get(
      'resources.ExpensiveResource',
    );
    expect(res3.value.toJSON()).to.eql({status: 'created', id: 1});
  });

  function givenContext() {
    ctx = new Context('test');
  }

  function givenPoolService(
    poolOptions: Options = {},
    ctor: Constructor<ExpensiveResource> = ExpensiveResource,
    initialStatus = 'created',
  ) {
    setupPoolingService(poolOptions, ctor, initialStatus);
    return ctx.get(POOLING_SERVICE);
  }

  function givenPoolServiceForBinding() {
    const MY_RESOURCE = BindingKey.create<ExpensiveResource>('my-resource');
    ctx.bind(MY_RESOURCE).toClass(ExpensiveResource);
    const factory = createPooledBindingFactory(MY_RESOURCE);
    const poolBinding = createBindingFromClass(PoolingService, {
      [ContextTags.KEY]: POOLING_SERVICE,
    });
    ctx.add(poolBinding);
    ctx
      .configure<PoolingServiceOptions<ExpensiveResource>>(poolBinding.key)
      .to({
        factory,
      });
    return ctx.get(POOLING_SERVICE);
  }

  /**
   * This simulates a resource that is expensive to create/start. For example,
   * a datasource has overhead to connect to the database. There will be performance
   * penalty to use `TRANSIENT` scope and creates a new instance per request.
   * But it is not feasible to be a singleton for some use cases, for example,
   * each request may have different security contexts.
   */
  class ExpensiveResource implements Poolable {
    static id = 1;
    id: number;
    status: string;

    constructor() {
      this.status = 'created';
      this.id = ExpensiveResource.id++;
    }

    toJSON() {
      return {id: this.id, status: this.status};
    }

    /**
     * Life cycle method to be called by `create`
     */
    start() {
      // In real world, this may take a few seconds to start
      this.status = 'started';
    }

    /**
     * Life cycle method to be called by `destroy`
     */
    stop() {
      this.status = 'stopped';
    }
  }

  /**
   * An expensive resource that implements `acquire` and `release` hooks
   */
  class ExpensiveResourceWithHooks
    extends ExpensiveResource
    implements Poolable
  {
    requestCtx?: Context;

    acquire(requestCtx: Context) {
      this.status = 'in-use';
      this.requestCtx = requestCtx;
    }

    release() {
      this.status = 'idle';
      this.requestCtx = undefined;
    }
  }

  /**
   * Wrap the expensive resource as a LoopBack binding provider
   */
  class ExpensiveResourceProvider
    implements Provider<PooledValue<ExpensiveResource>>
  {
    constructor(
      @inject(POOLING_SERVICE)
      private poolingService: PoolingService<ExpensiveResource>,
    ) {}

    async value() {
      return getPooledValue(this.poolingService);
    }
  }

  /**
   * Set up a pooling service
   * @param poolOptions - Pool options
   * @param ctor - Resource class
   * @param status - Initial status
   */
  function setupPoolingService(
    poolOptions: Options = {},
    ctor: Constructor<ExpensiveResource> = ExpensiveResource,
    status = 'created',
  ) {
    ExpensiveResource.id = 1;
    const poolBinding = createBindingFromClass(PoolingService, {
      [ContextTags.KEY]: POOLING_SERVICE,
    });
    ctx.add(poolBinding);
    const options: PoolingServiceOptions<ExpensiveResource> = {
      factory: {
        async create() {
          const res = new ctor();
          res.status = status;
          if (status === 'invalid') {
            // Reset status so that the next try will be good
            status = 'created';
          }
          return res;
        },

        async destroy(resource: ExpensiveResource) {
          resource.status = 'destroyed';
        },

        async validate(resource) {
          const result = resource.status === 'created';
          resource.status = 'validated';
          return result;
        },
      },
      poolOptions,
    };
    ctx
      .configure<PoolingServiceOptions<ExpensiveResource>>(poolBinding.key)
      .to(options);
  }
});
