// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get} from '@loopback/openapi-v2';

export class ControllerOne {
  @get('/one')
  one() {
    return 'ControllerOne.one()';
  }
}

export class ControllerTwo {
  @get('/two')
  two() {
    return 'ControllerTwo.two()';
  }
}

export function hello() {
  return 'hello world';
}
