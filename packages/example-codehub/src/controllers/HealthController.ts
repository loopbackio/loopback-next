// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {def} from './HealthController.api';
import {api, inject} from 'loopback';

@api(def)
export class HealthController {
  constructor(@inject('app.info') private _info : HealthResponse) {
    this._info = {uptime: 29389384};
  }

  async getHealth() : Promise<string> {
    return Promise.resolve(JSON.stringify(this._info));
  }
}

interface HealthResponse {
  uptime : number;
}
