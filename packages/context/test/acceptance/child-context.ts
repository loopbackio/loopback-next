// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context} from '../..';

describe('Context bindings - contexts inheritance', () => {
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
