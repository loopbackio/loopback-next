// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '../application';
import {ServerRequest, ServerResponse} from 'http';
import {Handler} from '../internal-types';

export function httpHandler(app: Application): Handler {
  return async (req: ServerRequest, res: ServerResponse): Promise<void> => {
    await app.handleHttp(req, res);
  };
}
