// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  belongsTo,
  BelongsToAccessor,
  Entity,
  EntityCrudRepository,
  model,
  property,
} from '@loopback/repository';
import {MixedIdType} from '../../../../helpers.repository-tests';
import {CustomerWithRelations} from './customer.model';
import {Stakeholder} from './stakeholder.model';

@model()
export class Contact extends Entity {
  @property({
    id: true,
    generated: true,
    useDefaultIdType: true,
  })
  id: MixedIdType;
  @property({
    type: 'string',
  })
  name: string;
  @property({
    type: 'string',
  })
  email: string;

  @belongsTo(() => Stakeholder, {polymorphic: true})
  stakeholderId: MixedIdType;

  @property({
    type: 'string',
    required: true,
    default: 'Customer',
  })
  stakeholderType: string;
}

export interface ContactRelations {
  stakeholder?: CustomerWithRelations;
}

export type ContactWithRelations = Contact & ContactRelations;

export interface ContactRepository
  extends EntityCrudRepository<Contact, typeof Contact.prototype.id> {
  // define additional members like relation methods here
  stakeholder: BelongsToAccessor<Stakeholder, MixedIdType>;
}
