// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerResponse} from 'http';

export function responseWriter(msg: Message) {
  // write the response using the given msg
}

// tslint:disable:no-any
export type Message = {
  http: {
    statusCode: number,
  }
  body?: string,
};
// tslint:enable:no-any
