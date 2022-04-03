// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, hasOne, model, property} from '@loopback/repository';
import {MixedIdType} from '../../../../helpers.repository-tests';
import {Contact} from './contact.model';

@model()
export class Stakeholder extends Entity {
  @property({
    id: true,
    generated: true,
    useDefaultIdType: true,
  })
  id: MixedIdType;

  @hasOne(() => Contact)
  contact: Contact;
}

// export interface StakeholderRelations {
//   contact: ContactWithRelations;
// }

// export type StakeholderWithRelations = Stakeholder & StakeholderRelations;

// export interface StakeholderRepository
//   extends EntityCrudRepository<Stakeholder, typeof Stakeholder.prototype.id> {
//   // define additional members like relation methods here
//   contact: HasOneRepositoryFactory<Contact, MixedIdType>;
// }
