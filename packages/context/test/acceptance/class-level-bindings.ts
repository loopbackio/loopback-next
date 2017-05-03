// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, inject, isPromise} from '../../src';

const INFO_CONTROLLER = 'controllers.info';

describe('Context bindings - Injecting dependencies of classes', () => {
  let ctx: Context;
  before('given a context', createContext);

  it('injects constructor args', async () => {
    ctx.bind('application.name').to('CodeHub');

    class InfoController {
      constructor(@inject('application.name') public appName: string) {
      }
    }
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    const instance = await ctx.get(INFO_CONTROLLER);
    expect(instance).to.have.property('appName', 'CodeHub');
  });

  it('throws helpful error when no ctor args are decorated', () => {
    class InfoController {
      constructor(appName: string) {
      }
    }
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    return ctx.get(INFO_CONTROLLER).then(
      function onSuccess() { throw new Error('ctx.get() should have failed'); },
      function onError(err) { expect(err).to.match(/resolve.*InfoController.*argument 1/); });
  });

  it('throws helpful error when some ctor args are not decorated', () => {
    ctx.bind('application.name').to('CodeHub');

    class InfoController {
      constructor(argNotInjected: string, @inject('application.name') appName: string) {
      }
    }
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    return ctx.get(INFO_CONTROLLER).then(
      function onSuccess() { throw new Error('ctx.get() should have failed'); },
      function onError(err) { expect(err).to.match(/resolve.*InfoController.*argument 1/); });
  });

  it('resolves promises before injecting parameters', async () => {
    ctx.bind('authenticated').toDynamicValue(async () => {
      // Emulate asynchronous database call
      await Promise.resolve();
      // Return the authentication result
      return false;
    });

    class InfoController {
      constructor(@inject('authenticated') public isAuthenticated: boolean) {
      }
    }
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    const instance = await ctx.get(INFO_CONTROLLER);
    expect(instance).to.have.property('isAuthenticated', false);
  });

  it('creates instance synchronously when all dependencies are sync too', () => {
    ctx.bind('appName').to('CodeHub');
    class InfoController {
      constructor(@inject('appName') public appName: string) {
      }
    }
    const b = ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    const valueOrPromise = b.getValue(ctx);
    expect(valueOrPromise).to.not.be.Promise();
    expect(valueOrPromise as InfoController).to.have.property('appName', 'CodeHub');
  });

  function createContext() {
    ctx = new Context();
  }
});
