// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerRequest} from 'http';
import {Application} from './Application';

export function requestParser(req: ServerRequest, app: Application) {
  // parse the request
  // put all the parsed stuff into the context
  // (ie. take all the parsing responsibility out of the router)
}
