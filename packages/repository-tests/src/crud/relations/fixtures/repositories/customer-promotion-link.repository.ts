// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../..';
import {CustomerPromotionLink, CustomerPromotionLinkRelations} from '../models';
// create the CustomerCartItemLinkRepo by calling this func so that it can be extended from CrudRepositoryCtor
export function createCustomerPromotionLinkRepo(repoClass: CrudRepositoryCtor) {
  return class CustomerPromotionLinkRepository extends repoClass<
    CustomerPromotionLink,
    typeof CustomerPromotionLink.prototype.id,
    CustomerPromotionLinkRelations
  > {
    constructor(db: juggler.DataSource) {
      super(CustomerPromotionLink, db);
    }
  };
}
