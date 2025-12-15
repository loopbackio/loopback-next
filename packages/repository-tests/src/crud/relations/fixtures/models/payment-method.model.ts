// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  belongsTo,
  Entity,
  EntityCrudRepository,
  hasOne,
  HasOneRepositoryFactory,
  model,
  property,
} from '@loopback/repository';
import {BelongsToAccessor} from '@loopback/repository/src';
import {Customer, CustomerWithRelations} from '.';
import {MixedIdType} from '../../../../helpers.repository-tests';
import {Stakeholder} from './stakeholder.model';

@model()
export class PaymentMethod extends Entity {
  @property({
    id: true,
    generated: true,
    useDefaultIdType: true,
  })
  id: MixedIdType;

  @belongsTo(() => Stakeholder)
  customerId: MixedIdType;
}

export interface PaymentMethodRelations {
  customer?: CustomerWithRelations[];
}

export type PaymentMethodWithRelations = PaymentMethod & PaymentMethodRelations;

@model()
export class CardInfo extends Entity {
  @property({
    id: true,
    generated: true,
    useDefaultIdType: true,
  })
  id: MixedIdType;

  @belongsTo(() => CreditCard)
  creditCardId: MixedIdType;

  @property({
    type: 'string',
    required: true,
    default: 'default holder',
  })
  cardHolder: string;
}

export interface CardInfoRelations {
  creditCard?: CreditCardWithRelations[];
}

export type CardInfoWithRelations = CardInfo & CardInfoRelations;

@model()
export class CreditCard extends PaymentMethod {
  @property({
    type: 'number',
    required: true,
    default: 0,
  })
  cardNumber: number;

  @hasOne(() => CardInfo)
  cardInfo: CardInfo;
}

export interface CreditCardRelations {
  customer?: CustomerWithRelations[];
  cardInfo: CardInfoWithRelations;
}

export type CreditCardWithRelations = CreditCard & CreditCardRelations;

@model()
export class Cash extends PaymentMethod {
  @property({
    type: 'string',
    required: true,
    default: 'default cash detail',
  })
  detail: string;
}

export interface CashRelations {
  customer?: CustomerWithRelations[];
}

export type CashWithRelations = Cash & CashRelations;

export interface CreditCardRepository extends EntityCrudRepository<
  CreditCard,
  typeof CreditCard.prototype.id
> {
  // define additional members like relation methods here
  customer: BelongsToAccessor<Customer, MixedIdType>;
  cardInfo: HasOneRepositoryFactory<CardInfo, MixedIdType>;
}

export interface CashRepository extends EntityCrudRepository<
  Cash,
  typeof Cash.prototype.id
> {
  // define additional members like relation methods here
  customer: BelongsToAccessor<Customer, MixedIdType>;
}

export interface CardInfoRepository extends EntityCrudRepository<
  CardInfo,
  typeof CardInfo.prototype.id
> {
  // define additional members like relation methods here
  creditCard: BelongsToAccessor<CreditCard, MixedIdType>;
}
