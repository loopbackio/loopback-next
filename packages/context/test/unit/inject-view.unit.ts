// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Binding,
  BindingScope,
  filterByTag,
  Context,
  ContextView,
  Getter,
  inject,
} from '../..';

describe('@inject.view', async () => {
  let ctx: Context;
  beforeEach(() => {
    ctx = givenContext();
  });

  class MyControllerWithGetter {
    @inject.view(filterByTag('foo'))
    getter: Getter<string[]>;
  }

  class MyControllerWithValues {
    constructor(
      @inject.view(filterByTag('foo'))
      public values: string[],
    ) {}
  }

  class MyControllerWithTracker {
    @inject.view(filterByTag('foo'))
    view: ContextView<string[]>;
  }

  it('reports error if the target type (Getter<string[]>) is not ContextView', async () => {
    ctx.bind('my-controller').toClass(MyControllerWithGetter);
    await expect(
      ctx.get<MyControllerWithGetter>('my-controller'),
    ).to.be.rejectedWith(
      'The type of MyControllerWithGetter.prototype.getter (Function) is not ContextView',
    );
  });

  it('reports error if the target type (string[]) is not ContextView', async () => {
    ctx.bind('my-controller').toClass(MyControllerWithValues);
    await expect(
      ctx.get<MyControllerWithValues>('my-controller'),
    ).to.be.rejectedWith(
      'The type of MyControllerWithValues.constructor[0] (Array) is not ContextView',
    );
  });

  it('injects as a view', async () => {
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

describe('@inject with filter function', async () => {
  let ctx: Context;
  beforeEach(() => {
    ctx = givenContext();
  });

  class MyControllerWithGetter {
    @inject.getter(filterByTag('foo'))
    getter: Getter<string[]>;
  }

  class MyControllerWithValues {
    constructor(
      @inject(filterByTag('foo'))
      public values: string[],
    ) {}
  }

  class MyControllerWithView {
    @inject(filterByTag('foo'))
    view: ContextView<string[]>;
  }

  class MyControllerWithGetter2 {
    @inject(filterByTag('foo'))
    getter: Getter<string[]>;
  }

  it('injects as getter', async () => {
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
    ctx.bind('my-controller').toClass(MyControllerWithValues);
    const inst = await ctx.get<MyControllerWithValues>('my-controller');
    expect(inst.values).to.eql(['BAR', 'FOO']);
  });

  it('refuses to inject as a view', async () => {
    ctx.bind('my-controller').toClass(MyControllerWithView);
    await expect(
      ctx.get<MyControllerWithView>('my-controller'),
    ).to.be.rejectedWith(
      'The type of MyControllerWithView.prototype.view' +
        ' (ContextView) is not Array',
    );
  });

  it('refuses to inject as a getter', async () => {
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
