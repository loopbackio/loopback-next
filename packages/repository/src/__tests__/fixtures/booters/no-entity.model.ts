// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {model, Model, property} from '../../..';

@model()
export class NoEntity extends Model {
  @property({id: true})
  id: number;

  @property({required: true})
  name: string;
}
