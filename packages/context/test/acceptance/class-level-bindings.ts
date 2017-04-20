// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from 'testlab';
import {Context, inject} from '../..';

const INFO_CONTROLLER = 'controllers.info';

describe('Context bindings - Injecting dependencies of classes', () => {
  let ctx: Context;
  before('given a context', createContext);

  it('injects constructor args', () => {
    ctx.bind('application.name').to('CodeHub');

    class InfoController {
      constructor(@inject('application.name') public appName: string) {
      }
    }
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    const instance = ctx.get(INFO_CONTROLLER);
    expect(instance).to.have.property('appName', 'CodeHub');
  });

  it('throws helpful error when no ctor args are decorated', () => {
    class InfoController {
      constructor(appName: string) {
      }
    }
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    expect.throws(
      () => ctx.get(INFO_CONTROLLER),
      /resolve.*InfoController.*argument 1/);
  });

  it('throws helpful error when some ctor args are not decorated', () => {
    ctx.bind('application.name').to('CodeHub');

    class InfoController {
      constructor(argNotInjected: string, @inject('application.name') appName: string) {
      }
    }
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    expect.throws(
      () => ctx.get(INFO_CONTROLLER),
      /resolve.*InfoController.*argument 1/);
  });

  function createContext() {
    ctx = new Context();
  }
});
