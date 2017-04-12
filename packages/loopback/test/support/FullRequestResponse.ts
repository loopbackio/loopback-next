// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RequestResponse} from 'request';

// A workaround for a possible bug in request-promise .d.ts,
// where RequestResponse interface does not include "body"
// property as it should
// TODO(bajtos) contribute this fix back to definitely-typed
export interface FullRequestResponse extends RequestResponse {
  readonly body: FullRequestResponse.Body;
}

export namespace FullRequestResponse {
  // The response body can be either a string, or a parsed JSON object/array
  // tslint:disable-next-line:no-any
  export type Body = any;
}
