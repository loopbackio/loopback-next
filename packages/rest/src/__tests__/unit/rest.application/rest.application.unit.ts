// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  ERR_NO_MULTI_SERVER,
  RestApplication,
  RestComponent,
  RestServer,
} from '../../..';

describe('RestApplication', () => {
  describe('throws', () => {
    it('when attempting to bind another server', () => {
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
