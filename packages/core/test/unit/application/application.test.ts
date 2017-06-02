// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, ShotRequest} from '@loopback/testlab';
import {Application, ServerRequest} from '../../..';

describe('Application', () => {
  describe('"logError" binding', () => {
    it('provides a default', async () => {
      const app = new Application();
      const logError = await app.get('logError');
      expect(logError.length).to.equal(3); // (err, statusCode, request)
    });

    it('can be customized by overriding Application._logError() method', async () => {
      let lastLog: string = 'logError() was not called';

      class MyApp extends Application {
        protected _logError(err: Error, statusCode: number, request: ServerRequest) {
          lastLog = `${request.url} ${statusCode} ${err.message}`;
        }
      }

      const app = new MyApp();
      const logError = await app.get('logError');
      logError(new Error('test-error'), 400, new ShotRequest({url: '/'}));

      expect(lastLog).to.equal('/ 400 test-error');
    });
  });
});

