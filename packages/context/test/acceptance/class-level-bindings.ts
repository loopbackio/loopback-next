// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from 'testlab';
import {Context, inject} from '../..';

describe('Context bindings - Injecting dependencies of classes', () => {
  let ctx: Context;
  before('given a context', createContext);

  it('injects constructor args', () => {
    ctx.bind('application.name').to('CodeHub');

    class InfoController {
      constructor(@inject('application.name') public appName: string) {
      }
    }
    ctx.bindClass('controllers.info', InfoController);

    const instance = ctx.get('controllers.info');
    expect(instance).to.have.property('appName', 'CodeHub');
  });

  function createContext() {
    ctx = new Context();
  }
});
