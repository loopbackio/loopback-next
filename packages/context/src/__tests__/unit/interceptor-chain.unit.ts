// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  compareBindingsByTag,
  Context,
  filterByTag,
  GenericInterceptor,
  GenericInterceptorChain,
  Next,
} from '../..';

describe('GenericInterceptorChain', () => {
  let ctx: Context;
  let interceptorChain: GenericInterceptorChain;
  let events: string[];

  beforeEach(givenContext);

  it('invokes interceptor functions', async () => {
    givenInterceptorChain(
      givenNamedInterceptor('interceptor1'),
      givenNamedInterceptor('interceptor2'),
    );
    const result = await interceptorChain.invokeInterceptors();
    expect(events).to.eql([
      'before-interceptor1',
      'before-interceptor2',
      'after-interceptor2',
      'after-interceptor1',
    ]);
    expect(result).to.be.undefined();
  });

  it('invokes an empty chain', async () => {
    givenInterceptorChain();
    const result = await interceptorChain.invokeInterceptors();
    expect(events).to.eql([]);
    expect(result).to.be.undefined();
  });

  it('honors return value', async () => {
    givenInterceptorChain(
      givenNamedInterceptor('interceptor1'),
      async (context, next) => {
        await next();
        return 'ABC';
      },
    );
    const result = await interceptorChain.invokeInterceptors();
    expect(result).to.eql('ABC');
  });

  it('skips downstream interceptors if next is not invoked', async () => {
    givenInterceptorChain(async (context, next) => {
      return 'ABC';
    }, givenNamedInterceptor('interceptor2'));
    await interceptorChain.invokeInterceptors();
    expect(events).to.eql([]);
  });

  it('passes bindings via context', async () => {
    givenInterceptorChain(
      async (context, next) => {
        context.bind('foo').to('1-req');
        await next();
        const foo = await context.get('foo');
        expect(foo).to.eql('2-res');
        context.bind('foo').to('1-res');
      },
      async (context, next) => {
        const foo = await context.get('foo');
        expect(foo).to.eql('1-req');
        await next();
        context.bind('foo').to('2-res');
      },
    );

    await interceptorChain.invokeInterceptors();
    const fooVal = await ctx.get('foo');
    expect(fooVal).to.eql('1-res');
  });

  it('catches error from the second interceptor', async () => {
    givenInterceptorChain(
      givenNamedInterceptor('interceptor1'),
      async (context, next) => {
        events.push('before-interceptor2');
        throw new Error('error in interceptor2');
      },
    );
    const resultPromise = interceptorChain.invokeInterceptors();
    await expect(resultPromise).to.be.rejectedWith('error in interceptor2');
    expect(events).to.eql(['before-interceptor1', 'before-interceptor2']);
  });

  it('catches error from the first interceptor', async () => {
    givenInterceptorChain(async (context, next) => {
      events.push('before-interceptor1');
      await next();
      throw new Error('error in interceptor1');
    }, givenNamedInterceptor('interceptor2'));
    const resultPromise = interceptorChain.invokeInterceptors();
    await expect(resultPromise).to.be.rejectedWith('error in interceptor1');
    expect(events).to.eql([
      'before-interceptor1',
      'before-interceptor2',
      'after-interceptor2',
    ]);
  });

  it('allows discovery of interceptors in context', async () => {
    const interceptor1 = givenNamedInterceptor('interceptor1');
    const interceptor2 = givenNamedInterceptor('interceptor2');
    ctx
      .bind('interceptor2')
      .to(interceptor2)
      .tag('my-interceptor-tag');
    ctx
      .bind('interceptor1')
      .to(interceptor1)
      .tag('my-interceptor-tag');
    interceptorChain = new GenericInterceptorChain(
      ctx,
      filterByTag('my-interceptor-tag'),
    );
    await interceptorChain.invokeInterceptors();
    expect(events).to.eql([
      'before-interceptor2',
      'before-interceptor1',
      'after-interceptor1',
      'after-interceptor2',
    ]);
  });

  it('allows discovery and sorting of interceptors in context', async () => {
    const interceptor1 = givenNamedInterceptor('interceptor1');
    const interceptor2 = givenNamedInterceptor('interceptor2');
    ctx
      .bind('interceptor2')
      .to(interceptor2)
      .tag('interceptor')
      .tag({phase: 'p2'});
    ctx
      .bind('interceptor1')
      .to(interceptor1)
      .tag('interceptor')
      .tag({phase: 'p1'});
    interceptorChain = new GenericInterceptorChain(
      ctx,
      filterByTag('interceptor'),
      compareBindingsByTag('phase', ['p1', 'p2']),
    );
    await interceptorChain.invokeInterceptors();
    expect(events).to.eql([
      'before-interceptor1',
      'before-interceptor2',
      'after-interceptor2',
      'after-interceptor1',
    ]);
  });

  function givenContext() {
    events = [];
    ctx = new Context();
  }

  function givenInterceptorChain(...interceptors: GenericInterceptor[]) {
    interceptorChain = new GenericInterceptorChain(ctx, interceptors);
  }

  function givenNamedInterceptor(name: string) {
    async function interceptor(context: Context, next: Next) {
      events.push(`before-${name}`);
      const result = await next();
      events.push(`after-${name}`);
      return result;
    }
    return interceptor;
  }
});
