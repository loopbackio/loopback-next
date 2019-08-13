// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as debugModule from 'debug';
import {Context, inject, invokeMethod, BindingKey} from '../..';
const debug = debugModule('loopback:context:test');

class InfoController {
  static sayHello(@inject('user') user: string): string {
    const msg = `Hello ${user}`;
    debug(msg);
    return msg;
  }

  hello(@inject('user', {optional: true}) user = 'Mary'): string {
    const msg = `Hello ${user}`;
    debug(msg);
    return msg;
  }

  greet(prefix: string, @inject('user') user: string): string {
    const msg = `[${prefix}] Hello ${user}`;
    debug(msg);
    return msg;
  }

  greetWithDefault(prefix = '***', @inject('user') user: string): string {
    const msg = `[${prefix}] Hello ${user}`;
    debug(msg);
    return msg;
  }
}

const INFO_CONTROLLER = BindingKey.create<InfoController>('controllers.info');

describe('Context bindings - Injecting dependencies of method', () => {
  let ctx: Context;
  beforeEach('given a context', createContext);

  it('injects prototype method args', async () => {
    const instance = await ctx.get(INFO_CONTROLLER);
    // Invoke the `hello` method => Hello John
    const msg = await invokeMethod(instance, 'hello', ctx);
    expect(msg).to.eql('Hello John');
  });

  it('injects optional prototype method args', async () => {
    ctx = new Context();
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);
    const instance = await ctx.get(INFO_CONTROLLER);
    // Invoke the `hello` method => Hello Mary
    const msg = await invokeMethod(instance, 'hello', ctx);
    expect(msg).to.eql('Hello Mary');
  });

  it('injects prototype method args with non-injected ones', async () => {
    const instance = await ctx.get(INFO_CONTROLLER);
    // Invoke the `hello` method => Hello John
    const msg = await invokeMethod(instance, 'greet', ctx, ['INFO']);
    expect(msg).to.eql('[INFO] Hello John');
  });

  it('injects prototype method args with non-injected ones with default', async () => {
    const instance = await ctx.get(INFO_CONTROLLER);
    // Invoke the `hello` method => Hello John
    const msg = await invokeMethod(instance, 'greetWithDefault', ctx, ['INFO']);
    expect(msg).to.eql('[INFO] Hello John');
  });

  it('injects static method args', async () => {
    // Invoke the `sayHello` method => Hello John
    const msg = await invokeMethod(InfoController, 'sayHello', ctx);
    expect(msg).to.eql('Hello John');
  });

  it('throws error if not all args can be resolved', async () => {
    const instance = await ctx.get(INFO_CONTROLLER);
    expect(() => {
      invokeMethod(instance, 'greet', ctx);
    }).to.throw(/The arguments\[0\] is not decorated for dependency injection/);
  });

  function createContext() {
    ctx = new Context();
    ctx.bind('user').toDynamicValue(() => Promise.resolve('John'));
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);
  }
});
