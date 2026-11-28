// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/booter-lb3app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {expect} from '@loopback/testlab';
import {Lb3AppBooter} from '../../lb3app.booter';

describe('Lb3AppBooter (unit)', () => {
  describe('constructor', () => {
    it('throws if the application does not support mountExpressRouter', () => {
      const app = new Application() as unknown as RestApplication;

      expect(() => new Lb3AppBooter(app, '/project-root')).to.throw(
        'Lb3AppBooter requires RestApplication with mountExpressRouter API',
      );
    });

    it('merges custom options with the defaults', () => {
      const app = {mountExpressRouter: () => {}} as unknown as RestApplication;

      const booter = new Lb3AppBooter(app, '/project-root', {
        path: '../custom/server',
      });

      expect(booter.options).to.eql({
        path: '../custom/server',
        mode: 'fullApp',
        restApiRoot: '/api',
      });
    });
  });

  describe('configure()', () => {
    it('resolves the lb3 app path against the project root', async () => {
      const app = {mountExpressRouter: () => {}} as unknown as RestApplication;
      const booter = new Lb3AppBooter(app, '/project-root', {
        path: '../custom/server',
      });

      await booter.configure!();

      expect(booter.appPath).to.equal('/custom/server');
    });
  });
});
