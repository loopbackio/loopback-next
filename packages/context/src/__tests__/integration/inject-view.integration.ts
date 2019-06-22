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

describe('@inject.view', () => {
  let ctx: Context;
  beforeEach(() => {
    ctx = givenContext();
  });

  it('reports error if the target type (Getter<string[]>) is not ContextView', async () => {
    class MyControllerWithGetter {
      @inject.view(filterByTag('foo'))
      getter: Getter<string[]>;
    }

    ctx.bind('my-controller').toClass(MyControllerWithGetter);
    await expect(
      ctx.get<MyControllerWithGetter>('my-controller'),
    ).to.be.rejectedWith(
      'The type of MyControllerWithGetter.prototype.getter (Function) is not ContextView',
    );
  });

  it('reports error if the target type (string[]) is not ContextView', async () => {
    class MyControllerWithValues {
      constructor(
        @inject.view(filterByTag('foo'))
        public values: string[],
      ) {}
    }

    ctx.bind('my-controller').toClass(MyControllerWithValues);
    await expect(
      ctx.get<MyControllerWithValues>('my-controller'),
    ).to.be.rejectedWith(
      'The type of MyControllerWithValues.constructor[0] (Array) is not ContextView',
    );
  });

  it('injects as a view', async () => {
    class MyControllerWithTracker {
      @inject.view(filterByTag('foo'))
      view: ContextView<string[]>;
    }

    ctx.bind('my-controller').toClass(MyControllerWithTracker);
    const inst = await ctx.get<MyControllerWithTracker>('my-controller');
    expect(inst.view).to.be.instanceOf(ContextView);
    expect(await inst.view.values()).to.eql(['BAR', 'FOO']);
    // Add a new binding that matches the filter
    ctx
      .bind('xyz')
      .to('XYZ')
      .tag('foo');
    // The view picks up the new binding
    expect(await inst.view.values()).to.eql(['BAR', 'XYZ', 'FOO']);
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
