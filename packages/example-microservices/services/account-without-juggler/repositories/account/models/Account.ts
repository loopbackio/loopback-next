// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  model,
  ModelDefinition,
  PropertyDefinition,
} from '@loopback/repository';

const definition = require('./account/model-definition');
@model(definition)
export class Account extends Entity {
  static definition = new ModelDefinition(definition);
  static modelName = 'Account';

  id: string;
  customerNumber: string;
  balance: number;
  branch: string;
  type: string;
  avgBalance: number;
  minimumBalance: number;

  constructor(body?: Partial<Account>) {
    super();
    if (body) {
      Object.assign(this, body);
    }
  }
}
