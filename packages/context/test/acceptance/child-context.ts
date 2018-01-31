// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context} from '../..';

describe('Context bindings - contexts with a single parent', () => {
  let parentCtx: Context;
  let childCtx: Context;

  beforeEach('given a parent and a child context', createParentAndChildContext);

  it('child inherits values bound in parent', () => {
    parentCtx.bind('foo').to('bar');
    expect(childCtx.getSync('foo')).to.equal('bar');
  });

  it('child changes are not propagated to parent', () => {
    childCtx.bind('foo').to('bar');
    expect(() => parentCtx.getSync('foo')).to.throw(/not bound/);
  });

  it('includes parent bindings when searching via find()', () => {
    parentCtx.bind('foo').to('parent:foo');
    parentCtx.bind('bar').to('parent:bar');
    childCtx.bind('foo').to('child:foo');

    const found = childCtx.find().map(b => b.getValue(childCtx));
    expect(found).to.deepEqual(['child:foo', 'parent:bar']);
  });

  it('includes parent bindings when searching via findByTag()', () => {
    parentCtx
      .bind('foo')
      .to('parent:foo')
      .tag('a-tag');
    parentCtx
      .bind('bar')
      .to('parent:bar')
      .tag('a-tag');
    childCtx
      .bind('foo')
      .to('child:foo')
      .tag('a-tag');

    const found = childCtx.findByTag('a-tag').map(b => b.getValue(childCtx));
    expect(found).to.deepEqual(['child:foo', 'parent:bar']);
  });

  function createParentAndChildContext() {
    parentCtx = new Context();
    childCtx = new Context(parentCtx);
  }
});

describe('Context bindings - contexts composed with other ones', () => {
  let appCtx: Context;
  let serverCtx: Context;
  let connectorCtx: Context;
  let reqCtx: Context;

  beforeEach('given multiple parents and a child context', createContextGraph);

  it('child inherits values bound in parent chain', () => {
    appCtx.bind('foo').to('bar');
    expect(reqCtx.getSync('foo')).to.equal('bar');
  });

  it('bindings are resolved in current context first', () => {
    appCtx.bind('foo').to('app:bar');
    serverCtx.bind('foo').to('server:bar');
    connectorCtx.bind('foo').to('connector:bar');
    reqCtx.bind('foo').to('req:bar');
    // req
    expect(reqCtx.getSync('foo')).to.equal('req:bar');
  });

  it('bindings are resolved by the order of parents', () => {
    appCtx.bind('foo').to('app:bar');
    serverCtx.bind('foo').to('server:bar');
    connectorCtx.bind('foo').to('connector:bar');
    // req -> server
    expect(reqCtx.getSync('foo')).to.equal('server:bar');
  });

  it('bindings are resolved in first parent chain', () => {
    appCtx.bind('foo').to('app:bar');
    connectorCtx.bind('foo').to('connector:bar');
    // req -> server -> connector -> app
    expect(reqCtx.getSync('foo')).to.equal('connector:bar');
  });

  it('child changes are not propagated to parent', () => {
    reqCtx.bind('foo').to('bar');
    expect(() => serverCtx.getSync('foo')).to.throw(/not bound/);
    expect(() => connectorCtx.getSync('foo')).to.throw(/not bound/);
    expect(() => appCtx.getSync('foo')).to.throw(/not bound/);
  });

  it('includes parent bindings when searching via getBinding()', () => {
    appCtx.bind('foo').to('app:foo');
    appCtx.bind('bar').to('app:bar');
    serverCtx.bind('foo').to('server:foo');
    connectorCtx.bind('foo').to('connector:foo');
    const binding = reqCtx.bind('foo').to('req:foo');

    const found = reqCtx.getBinding('foo');
    expect(found).to.be.exactly(binding);
  });

  it('includes parent bindings when searching via find()', () => {
    appCtx.bind('foo').to('app:foo');
    appCtx.bind('bar').to('app:bar');
    serverCtx.bind('foo').to('server:foo');
    serverCtx.bind('bar').to('server:bar');
    connectorCtx.bind('foo').to('connector:foo');
    reqCtx.bind('foo').to('req:foo');

    const found = reqCtx.find().map(b => b.getValue(reqCtx));
    expect(found).to.deepEqual(['req:foo', 'server:bar']);
  });

  it('includes parent bindings when searching via findByTag()', () => {
    appCtx
      .bind('foo')
      .to('app:foo')
      .tag('a-tag');
    appCtx
      .bind('bar')
      .to('app:bar')
      .tag('a-tag');
    serverCtx
      .bind('foo')
      .to('server:foo')
      .tag('a-tag');
    connectorCtx
      .bind('baz')
      .to('connector:baz')
      .tag('a-tag');
    reqCtx
      .bind('foo')
      .to('req:foo')
      .tag('a-tag');

    const found = reqCtx.findByTag('a-tag').map(b => b.getValue(reqCtx));
    expect(found).to.deepEqual(['req:foo', 'connector:baz', 'app:bar']);
  });

  function createContextGraph() {
    appCtx = new Context(undefined, 'app'); // The root
    serverCtx = new Context(appCtx, 'server'); // server -> app
    connectorCtx = new Context(appCtx, 'connector'); // connector -> app
    reqCtx = new Context().composeWith([serverCtx, connectorCtx], 'req'); // req -> [server, connector]
  }
});
