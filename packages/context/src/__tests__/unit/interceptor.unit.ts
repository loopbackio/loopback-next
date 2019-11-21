// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, skipIf} from '@loopback/testlab';
import {
  asGlobalInterceptor,
  Context,
  ContextBindings,
  ContextTags,
  createBindingFromClass,
  globalInterceptor,
  GLOBAL_INTERCEPTOR_NAMESPACE,
  InterceptedInvocationContext,
  Interceptor,
  InterceptorOrKey,
  InvocationSource,
  mergeInterceptors,
  Provider,
} from '../..';

describe('mergeInterceptors', () => {
  it('removes duplicate entries from the spec', () => {
    assertMergeAsExpected(['log'], ['cache', 'log'], ['cache', 'log']);
    assertMergeAsExpected(['log'], ['log', 'cache'], ['log', 'cache']);
  });

  it('allows empty array for interceptors', () => {
    assertMergeAsExpected([], ['cache', 'log'], ['cache', 'log']);
    assertMergeAsExpected(['cache', 'log'], [], ['cache', 'log']);
  });

  it('joins two arrays for interceptors', () => {
    assertMergeAsExpected(['cache'], ['log'], ['cache', 'log']);
  });

  function assertMergeAsExpected(
    interceptorsFromSpec: InterceptorOrKey[],
    existingInterceptors: InterceptorOrKey[],
    expectedResult: InterceptorOrKey[],
  ) {
    expect(
      mergeInterceptors(interceptorsFromSpec, existingInterceptors),
    ).to.eql(expectedResult);
  }
});

describe('globalInterceptors', () => {
  let ctx: Context;

  const logInterceptor: Interceptor = async (context, next) => {
    await next();
  };
  const authInterceptor: Interceptor = async (context, next) => {
    await next();
  };

  beforeEach(givenContext);

  it('sorts by group', () => {
    ctx
      .bind(ContextBindings.GLOBAL_INTERCEPTOR_ORDERED_GROUPS)
      .to(['log', 'auth']);

    ctx
      .bind('globalInterceptors.authInterceptor')
      .to(authInterceptor)
      .apply(asGlobalInterceptor('auth'));

    ctx
      .bind('globalInterceptors.logInterceptor')
      .to(logInterceptor)
      .apply(asGlobalInterceptor('log'));

    const invocationCtx = givenInvocationContext();

    const keys = invocationCtx.getGlobalInterceptorBindingKeys();
    expect(keys).to.eql([
      'globalInterceptors.logInterceptor',
      'globalInterceptors.authInterceptor',
    ]);
  });

  it('sorts by group - unknown group comes before known ones', () => {
    ctx
      .bind(ContextBindings.GLOBAL_INTERCEPTOR_ORDERED_GROUPS)
      .to(['log', 'auth']);

    ctx
      .bind('globalInterceptors.authInterceptor')
      .to(authInterceptor)
      .apply(asGlobalInterceptor('auth'));

    ctx
      .bind('globalInterceptors.logInterceptor')
      .to(logInterceptor)
      .apply(asGlobalInterceptor('unknown'));

    const invocationCtx = givenInvocationContext();

    const keys = invocationCtx.getGlobalInterceptorBindingKeys();
    expect(keys).to.eql([
      'globalInterceptors.logInterceptor',
      'globalInterceptors.authInterceptor',
    ]);
  });

  it('sorts by group alphabetically without ordered group', () => {
    ctx
      .bind('globalInterceptors.authInterceptor')
      .to(authInterceptor)
      .apply(asGlobalInterceptor('auth'));

    ctx
      .bind('globalInterceptors.logInterceptor')
      .to(logInterceptor)
      .apply(asGlobalInterceptor('log'));

    const invocationCtx = givenInvocationContext();

    const keys = invocationCtx.getGlobalInterceptorBindingKeys();
    expect(keys).to.eql([
      'globalInterceptors.authInterceptor',
      'globalInterceptors.logInterceptor',
    ]);
  });

  // See https://v8.dev/blog/array-sort
  function isSortStable() {
    // v8 7.0 or above
    return +process.versions.v8.split('.')[0] >= 7;
  }

  skipIf(
    !isSortStable(),
    it,
    'sorts by binding order without group tags',
    async () => {
      ctx
        .bind('globalInterceptors.authInterceptor')
        .to(authInterceptor)
        .apply(asGlobalInterceptor());

      ctx
        .bind('globalInterceptors.logInterceptor')
        .to(logInterceptor)
        .apply(asGlobalInterceptor());

      const invocationCtx = givenInvocationContext();

      const keys = invocationCtx.getGlobalInterceptorBindingKeys();
      expect(keys).to.eql([
        'globalInterceptors.authInterceptor',
        'globalInterceptors.logInterceptor',
      ]);
    },
  );

  it('applies asGlobalInterceptor', () => {
    const binding = ctx
      .bind('globalInterceptors.authInterceptor')
      .to(authInterceptor)
      .apply(asGlobalInterceptor('auth'));

    expect(binding.tagMap).to.eql({
      [ContextTags.NAMESPACE]: GLOBAL_INTERCEPTOR_NAMESPACE,
      [ContextTags.GLOBAL_INTERCEPTOR]: ContextTags.GLOBAL_INTERCEPTOR,
      [ContextTags.GLOBAL_INTERCEPTOR_GROUP]: 'auth',
    });
  });

  it('supports @globalInterceptor', () => {
    @globalInterceptor('auth', {
      tags: {[ContextTags.NAME]: 'my-auth-interceptor'},
    })
    class MyAuthInterceptor implements Provider<Interceptor> {
      value() {
        return authInterceptor;
      }
    }
    const binding = createBindingFromClass(MyAuthInterceptor);

    expect(binding.tagMap).to.eql({
      [ContextTags.TYPE]: 'provider',
      [ContextTags.PROVIDER]: 'provider',
      [ContextTags.NAMESPACE]: GLOBAL_INTERCEPTOR_NAMESPACE,
      [ContextTags.GLOBAL_INTERCEPTOR]: ContextTags.GLOBAL_INTERCEPTOR,
      [ContextTags.GLOBAL_INTERCEPTOR_GROUP]: 'auth',
      [ContextTags.NAME]: 'my-auth-interceptor',
    });
  });

  it('includes interceptors that match the source type', () => {
    ctx
      .bind('globalInterceptors.authInterceptor')
      .to(authInterceptor)
      .apply(asGlobalInterceptor('auth'))
      // Allows `route` source type explicitly
      .tag({[ContextTags.GLOBAL_INTERCEPTOR_SOURCE]: 'route'});

    ctx
      .bind('globalInterceptors.logInterceptor')
      .to(logInterceptor)
      .apply(asGlobalInterceptor('log'));
    // No source type is tagged - always apply

    const invocationCtx = givenInvocationContext('route');

    const keys = invocationCtx.getGlobalInterceptorBindingKeys();
    expect(keys).to.eql([
      'globalInterceptors.authInterceptor',
      'globalInterceptors.logInterceptor',
    ]);
  });

  it('excludes interceptors that do not match the source type', () => {
    ctx
      .bind('globalInterceptors.authInterceptor')
      .to(authInterceptor)
      .apply(asGlobalInterceptor('auth'))
      // Do not apply for `proxy` source type
      .tag({[ContextTags.GLOBAL_INTERCEPTOR_SOURCE]: 'route'});

    ctx
      .bind('globalInterceptors.logInterceptor')
      .to(logInterceptor)
      .apply(asGlobalInterceptor('log'));

    const invocationCtx = givenInvocationContext('proxy');

    const keys = invocationCtx.getGlobalInterceptorBindingKeys();
    expect(keys).to.eql(['globalInterceptors.logInterceptor']);
  });

  it('excludes interceptors that do not match the source type - with array', () => {
    ctx
      .bind('globalInterceptors.authInterceptor')
      .to(authInterceptor)
      .apply(asGlobalInterceptor('auth'))
      // Do not apply for `proxy` source type
      .tag({[ContextTags.GLOBAL_INTERCEPTOR_SOURCE]: 'route'});

    ctx
      .bind('globalInterceptors.logInterceptor')
      .to(logInterceptor)
      .apply(asGlobalInterceptor('log'))
      .tag({[ContextTags.GLOBAL_INTERCEPTOR_SOURCE]: ['route', 'proxy']});

    const invocationCtx = givenInvocationContext('proxy');

    const keys = invocationCtx.getGlobalInterceptorBindingKeys();
    expect(keys).to.eql(['globalInterceptors.logInterceptor']);
  });

  class MyController {
    greet(name: string) {
      return `Hello, ${name}`;
    }
  }

  function givenContext() {
    ctx = new Context();
  }

  function givenInvocationContext(source?: string) {
    let invocationSource: InvocationSource<string> | undefined = undefined;
    if (source != null) {
      invocationSource = {
        type: source,
        value: source,
      };
    }
    return new InterceptedInvocationContext(
      ctx,
      new MyController(),
      'greet',
      ['John'],
      invocationSource,
    );
  }
});
