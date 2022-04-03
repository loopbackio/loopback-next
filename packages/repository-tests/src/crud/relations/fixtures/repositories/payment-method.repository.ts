// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/core';
import {
  BelongsToAccessor,
  BelongsToDefinition,
  createBelongsToAccessor,
  createHasOneRepositoryFactory,
  HasOneDefinition,
  HasOneRepositoryFactory,
  juggler,
} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../..';
import {
  CardInfo,
  CardInfoRelations,
  Cash,
  CashRelations,
  CreditCard,
  CreditCardRelations,
  Customer,
} from '../models';

export function createCreditCardRepo(repoClass: CrudRepositoryCtor) {
  return class CreditCardRepository extends repoClass<
    CreditCard,
    typeof CreditCard.prototype.id,
    CreditCardRelations
  > {
    public readonly customer: BelongsToAccessor<
      Customer,
      typeof CreditCard.prototype.id
    >;

    public readonly cardInfo: HasOneRepositoryFactory<
      CardInfo,
      typeof CreditCard.prototype.id
    >;

    constructor(
      db: juggler.DataSource,
      customerRepositoryGetter: Getter<typeof repoClass.prototype>,
      cardInfoRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(CreditCard, db);
      // create a belongsto relation from this public method
      const customerMeta = this.entityClass.definition.relations['customer'];
      this.customer = createBelongsToAccessor(
        customerMeta as BelongsToDefinition,
        customerRepositoryGetter,
        this,
      );
      const cardInfoMeta = this.entityClass.definition.relations['cardInfo'];
      this.cardInfo = createHasOneRepositoryFactory(
        cardInfoMeta as HasOneDefinition,
        cardInfoRepositoryGetter,
      );
    }
  };
}

export function createCashRepo(repoClass: CrudRepositoryCtor) {
  return class CashRepository extends repoClass<
    Cash,
    typeof Cash.prototype.id,
    CashRelations
  > {
    public readonly customer: BelongsToAccessor<
      Customer,
      typeof Cash.prototype.id
    >;

    constructor(
      db: juggler.DataSource,
      customerRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(Cash, db);
      // create a belongsto relation from this public method
      const customerMeta = this.entityClass.definition.relations['customer'];
      this.customer = createBelongsToAccessor(
        customerMeta as BelongsToDefinition,
        customerRepositoryGetter,
        this,
      );
    }
  };
}

export function createCardInfoRepo(repoClass: CrudRepositoryCtor) {
  return class CardInfoRepository extends repoClass<
    CardInfo,
    typeof CardInfo.prototype.id,
    CardInfoRelations
  > {
    public readonly creditCard: BelongsToAccessor<
      CreditCard,
      typeof CardInfo.prototype.id
    >;

    constructor(
      db: juggler.DataSource,
      creditCardRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(CardInfo, db);
      // create a belongsto relation from this public method
      const creditCardMeta =
        this.entityClass.definition.relations['creditCard'];
      this.creditCard = createBelongsToAccessor(
        creditCardMeta as BelongsToDefinition,
        creditCardRepositoryGetter,
        this,
      );
    }
  };
}
