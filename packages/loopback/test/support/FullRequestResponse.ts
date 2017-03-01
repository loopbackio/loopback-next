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
  readonly body: any;
}
