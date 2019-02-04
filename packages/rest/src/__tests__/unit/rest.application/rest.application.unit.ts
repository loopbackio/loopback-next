// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  RestApplication,
  RestServer,
  RestComponent,
  ERR_NO_MULTI_SERVER,
} from '../../..';
import {expect} from '@loopback/testlab';

describe('RestApplication', () => {
  describe('throws', () => {
    it('when attempting to bind another server', () => {
      // tslint:disable-next-line:no-unused
      const app = new RestApplication();
      expect.throws(
        () => {
          app.server(RestServer, 'oops');
        },
        Error,
        ERR_NO_MULTI_SERVER,
      );
    });

    it('when attempting to bind an array of servers', () => {
      // tslint:disable-next-line:no-unused
      const app = new RestApplication();
      expect.throws(
        () => {
          app.servers([RestServer, RestServer]);
        },
        Error,
        ERR_NO_MULTI_SERVER,
      );
    });

    it('when attempting bind multiple servers via RestComponent', () => {
      class OtherRestComponent extends RestComponent {}
      expect.throws(
        () => {
          // tslint:disable-next-line:no-unused
          const app = new RestApplication();
          app.component(RestComponent);
          app.component(OtherRestComponent);
        },
        Error,
        ERR_NO_MULTI_SERVER,
      );
    });
  });
});
