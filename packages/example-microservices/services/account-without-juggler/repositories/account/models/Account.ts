import {
  Entity,
  model,
  ModelDefinition,
  PropertyDefinition
} from '@loopback/repository';

@model(require('./account/model-definition'))
export class Account extends Entity {
  static definition = new ModelDefinition('Account', require('./account/model-definition').properties);
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
