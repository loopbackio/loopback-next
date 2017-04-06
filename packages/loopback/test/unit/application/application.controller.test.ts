// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from 'testlab';
import {Application} from './../../../lib/application';

describe('Application.controller()', () => {
  it('binds the controller to "controllers.*" namespace', () => {
    const app = new Application();

    class TestController {
    }

    app.controller(TestController);

    const boundControllers = app.find('controllers.*').map(b => b.key);
    expect(boundControllers).to.containEql('controllers.TestController');
  });
});
