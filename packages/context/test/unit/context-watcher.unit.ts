// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Binding,
  BindingScope,
  Context,
  ContextWatcher,
  Getter,
  inject,
} from '../..';

describe('ContextWatcher', () => {
  let ctx: Context;
  let bindings: Binding<unknown>[];
  let contextWatcher: ContextWatcher;

  beforeEach(givenContextWatcher);

  it('tracks bindings', () => {
    expect(contextWatcher.bindings).to.eql(bindings);
  });

  it('resolves bindings', async () => {
    expect(await contextWatcher.resolve()).to.eql(['BAR', 'FOO']);
    expect(await contextWatcher.values()).to.eql(['BAR', 'FOO']);
  });

  it('resolves bindings as a getter', async () => {
    expect(await contextWatcher.asGetter()()).to.eql(['BAR', 'FOO']);
  });

  it('reloads bindings after reset', async () => {
    contextWatcher.reset();
    const abcBinding = ctx
      .bind('abc')
      .to('ABC')
      .tag('abc');
    const xyzBinding = ctx
      .bind('xyz')
      .to('XYZ')
      .tag('foo');
    expect(contextWatcher.bindings).to.containEql(xyzBinding);
    // `abc` does not have the matching tag
    expect(contextWatcher.bindings).to.not.containEql(abcBinding);
    expect(await contextWatcher.values()).to.eql(['BAR', 'XYZ', 'FOO']);
  });

  it('reloads bindings if context bindings are added', async () => {
    const abcBinding = ctx
      .bind('abc')
      .to('ABC')
      .tag('abc');
    const xyzBinding = ctx
      .bind('xyz')
      .to('XYZ')
      .tag('foo');
    expect(contextWatcher.bindings).to.containEql(xyzBinding);
    // `abc` does not have the matching tag
    expect(contextWatcher.bindings).to.not.containEql(abcBinding);
    expect(await contextWatcher.values()).to.eql(['BAR', 'XYZ', 'FOO']);
  });

  it('reloads bindings if context bindings are removed', async () => {
    ctx.unbind('bar');
    expect(await contextWatcher.values()).to.eql(['FOO']);
  });

  it('reloads bindings if context bindings are rebound', async () => {
    ctx.bind('bar').to('BAR'); // No more tagged with `foo`
    expect(await contextWatcher.values()).to.eql(['FOO']);
  });

  it('reloads bindings if parent context bindings are added', async () => {
    const xyzBinding = ctx
      .parent!.bind('xyz')
      .to('XYZ')
      .tag('foo');
    expect(contextWatcher.bindings).to.containEql(xyzBinding);
    expect(await contextWatcher.values()).to.eql(['BAR', 'FOO', 'XYZ']);
  });

  it('reloads bindings if parent context bindings are removed', async () => {
    ctx.parent!.unbind('foo');
    expect(await contextWatcher.values()).to.eql(['BAR']);
  });

  it('stops watching', async () => {
    expect(await contextWatcher.values()).to.eql(['BAR', 'FOO']);
    contextWatcher.unwatch();
    ctx.parent!.unbind('foo');
    expect(await contextWatcher.values()).to.eql(['BAR', 'FOO']);
  });

  function givenContextWatcher() {
    bindings = [];
    ctx = givenContext(bindings);
    contextWatcher = ctx.watch(Context.bindingTagFilter('foo'));
  }
});

describe('@inject.filter', async () => {
  let ctx: Context;
  beforeEach(() => (ctx = givenContext()));

  class MyControllerWithGetter {
    @inject.filter(Context.bindingTagFilter('foo'), {watch: true})
    getter: Getter<string[]>;
  }

  class MyControllerWithValues {
    constructor(
      @inject.filter(Context.bindingTagFilter('foo'))
      public values: string[],
    ) {}
  }

  class MyControllerWithTracker {
    @inject.filter(Context.bindingTagFilter('foo'))
    tracker: ContextWatcher<string[]>;
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

  it('injects as a tracker', async () => {
    ctx.bind('my-controller').toClass(MyControllerWithTracker);
    const inst = await ctx.get<MyControllerWithTracker>('my-controller');
    expect(inst.tracker).to.be.instanceOf(ContextWatcher);
    expect(await inst.tracker.values()).to.eql(['BAR', 'FOO']);
    // Add a new binding that matches the filter
    ctx
      .bind('xyz')
      .to('XYZ')
      .tag('foo');
    // The tracker picks up the new binding
    expect(await inst.tracker.values()).to.eql(['BAR', 'XYZ', 'FOO']);
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
