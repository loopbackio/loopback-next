// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Binding,
  BindingScope,
  Context,
  ContextView,
  filterByTag,
  Getter,
  inject,
} from '../..';

describe('@inject.* to receive multiple values matching a filter', () => {
  let ctx: Context;
  beforeEach(() => {
    ctx = givenContext();
  });

  it('injects as getter', async () => {
    class MyControllerWithGetter {
      @inject.getter(filterByTag('foo'))
      getter: Getter<string[]>;
    }

    ctx.bind('my-controller').toClass(MyControllerWithGetter);
    const inst = await ctx.get<MyControllerWithGetter>('my-controller');
    const getter = inst.getter;
    expect(getter).to.be.a.Function();
    expect(await getter()).to.eql(['BAR', 'FOO']);
    // Add a new binding that matches the filter
    ctx
      .bind('xyz')
      .to('XYZ')
      .tag('foo');
    // The getter picks up the new binding
    expect(await getter()).to.eql(['BAR', 'XYZ', 'FOO']);
  });

  it('injects as values', async () => {
    class MyControllerWithValues {
      constructor(
        @inject(filterByTag('foo'))
        public values: string[],
      ) {}
    }

    ctx.bind('my-controller').toClass(MyControllerWithValues);
    const inst = await ctx.get<MyControllerWithValues>('my-controller');
    expect(inst.values).to.eql(['BAR', 'FOO']);
  });

  it('refuses to inject as a view', async () => {
    class MyControllerWithView {
      @inject(filterByTag('foo'))
      view: ContextView<string[]>;
    }

    ctx.bind('my-controller').toClass(MyControllerWithView);
    await expect(
      ctx.get<MyControllerWithView>('my-controller'),
    ).to.be.rejectedWith(
      'The type of MyControllerWithView.prototype.view' +
        ' (ContextView) is not Array',
    );
  });

  it('refuses to inject as a getter', async () => {
    class MyControllerWithGetter2 {
      @inject(filterByTag('foo'))
      getter: Getter<string[]>;
    }

    ctx.bind('my-controller').toClass(MyControllerWithGetter2);
    await expect(
      ctx.get<MyControllerWithGetter2>('my-controller'),
    ).to.be.rejectedWith(
      'The type of MyControllerWithGetter2.prototype.getter' +
        ' (Function) is not Array',
    );
  });
});

function givenContext(bindings: Binding[] = []) {
  const parent = new Context('app');
  const ctx = new Context(parent, 'server');
  bindings.push(
    ctx
      .bind('bar')
      .toDynamicValue(() => Promise.resolve('BAR'))
      .tag('foo', 'bar')
      .inScope(BindingScope.SINGLETON),
  );
  bindings.push(
    parent
      .bind('foo')
      .to('FOO')
      .tag('foo', 'bar'),
  );
  return ctx;
}
