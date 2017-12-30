// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get} from '@loopback/rest';

export class AdminController {
  constructor() {}

  @get('/admin')
  admin() {
    return 'Hello Admin';
  }
}
