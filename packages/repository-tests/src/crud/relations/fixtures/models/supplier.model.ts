// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  EntityCrudRepository,
  HasOneRepositoryFactory,
  model,
  property,
} from '@loopback/repository';
import {MixedIdType} from '../../../../helpers.repository-tests';
import {Contact} from './contact.model';
import {PaymentMethodWithRelations} from './payment-method.model';
import {Stakeholder} from './stakeholder.model';

@model()
export class Supplier extends Stakeholder {
  @property({
    type: 'string',
  })
  name: string;
}

export interface SupplierRelations {
  contact?: PaymentMethodWithRelations;
}

export type SupplierWithRelations = Supplier & SupplierRelations;

export interface SupplierRepository
  extends EntityCrudRepository<Supplier, typeof Supplier.prototype.id> {
  // define additional members like relation methods here
  contact: HasOneRepositoryFactory<Contact, MixedIdType>;
}
