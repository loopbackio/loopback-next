// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Binding, BindingScope, filterByTag, Context, ContextView} from '../..';

describe('ContextView', () => {
  let app: Context;
  let server: Context;

  let bindings: Binding<unknown>[];
  let taggedAsFoo: ContextView;

  beforeEach(givenContextView);

  it('tracks bindings', () => {
    expect(taggedAsFoo.bindings).to.eql(bindings);
  });

  it('resolves bindings', async () => {
    expect(await taggedAsFoo.resolve()).to.eql(['BAR', 'FOO']);
    expect(await taggedAsFoo.values()).to.eql(['BAR', 'FOO']);
  });

  it('resolves bindings as a getter', async () => {
    expect(await taggedAsFoo.asGetter()()).to.eql(['BAR', 'FOO']);
  });

  it('reloads bindings after refresh', async () => {
    taggedAsFoo.refresh();
    const abcBinding = server
      .bind('abc')
      .to('ABC')
      .tag('abc');
    const xyzBinding = server
      .bind('xyz')
      .to('XYZ')
      .tag('foo');
    expect(taggedAsFoo.bindings).to.containEql(xyzBinding);
    // `abc` does not have the matching tag
    expect(taggedAsFoo.bindings).to.not.containEql(abcBinding);
    expect(await taggedAsFoo.values()).to.eql(['BAR', 'XYZ', 'FOO']);
  });

  it('reloads bindings if context bindings are added', async () => {
    const abcBinding = server
      .bind('abc')
      .to('ABC')
      .tag('abc');
    const xyzBinding = server
      .bind('xyz')
      .to('XYZ')
      .tag('foo');
    expect(taggedAsFoo.bindings).to.containEql(xyzBinding);
    // `abc` does not have the matching tag
    expect(taggedAsFoo.bindings).to.not.containEql(abcBinding);
    expect(await taggedAsFoo.values()).to.eql(['BAR', 'XYZ', 'FOO']);
  });

  it('reloads bindings if context bindings are removed', async () => {
    server.unbind('bar');
    expect(await taggedAsFoo.values()).to.eql(['FOO']);
  });

  it('reloads bindings if context bindings are rebound', async () => {
    server.bind('bar').to('BAR'); // No more tagged with `foo`
    expect(await taggedAsFoo.values()).to.eql(['FOO']);
  });

  it('reloads bindings if parent context bindings are added', async () => {
    const xyzBinding = app
      .bind('xyz')
      .to('XYZ')
      .tag('foo');
    expect(taggedAsFoo.bindings).to.containEql(xyzBinding);
    expect(await taggedAsFoo.values()).to.eql(['BAR', 'FOO', 'XYZ']);
  });

  it('reloads bindings if parent context bindings are removed', async () => {
    app.unbind('foo');
    expect(await taggedAsFoo.values()).to.eql(['BAR']);
  });

  it('stops watching', async () => {
    expect(await taggedAsFoo.values()).to.eql(['BAR', 'FOO']);
    taggedAsFoo.close();
    app.unbind('foo');
    expect(await taggedAsFoo.values()).to.eql(['BAR', 'FOO']);
  });

  function givenContextView() {
    bindings = [];
    givenContext();
    taggedAsFoo = server.createView(filterByTag('foo'));
  }

  function givenContext() {
    app = new Context('app');
    server = new Context(app, 'server');
    bindings.push(
      server
        .bind('bar')
        .toDynamicValue(() => Promise.resolve('BAR'))
        .tag('foo', 'bar')
        .inScope(BindingScope.SINGLETON),
    );
    bindings.push(
      app
        .bind('foo')
        .to('FOO')
        .tag('foo', 'bar'),
    );
  }
});
