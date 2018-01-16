// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-codehub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {def} from './health-controller.api';
import {api} from '@loopback/rest';
import {inject} from '@loopback/core';

@api(def)
export class HealthController {
  constructor(@inject('app.info') private _info: HealthResponse) {
    this._info = {uptime: 29389384};
  }

  async getHealth(): Promise<HealthResponse> {
    return Promise.resolve(this._info);
  }
}

export interface HealthResponse {
  uptime: number;
}
