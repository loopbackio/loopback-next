// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, juggler} from '@loopback/repository';
import {CrudFeatures, CrudRepositoryCtor} from '../..';
import {
  Address,
  AddressRepository,
  CardInfo,
  CardInfoRepository,
  CartItem,
  CartItemRepository,
  Cash,
  CashRepository,
  Contact,
  ContactRepository,
  CreditCard,
  CreditCardRepository,
  Customer,
  CustomerCartItemLink,
  CustomerCartItemLinkRepository,
  CustomerPromotionLink,
  CustomerPromotionLinkRepository,
  CustomerRepository,
  FreeDelivery,
  FreeDeliveryRepository,
  HalfPrice,
  HalfPriceRepository,
  Order,
  OrderRepository,
  Shipment,
  ShipmentRepository,
  Supplier,
  SupplierRepository,
  User,
  UserLink,
  UserLinkRepository,
  UserRepository,
} from './fixtures/models';
import {
  createAddressRepo,
  createCardInfoRepo,
  createCartItemRepo,
  createCashRepo,
  createContactRepo,
  createCreditCardRepo,
  createCustomerCartItemLinkRepo,
  createCustomerPromotionLinkRepo,
  createCustomerRepo,
  createFreeDeliveryRepo,
  createHalfPriceRepo,
  createOrderRepo,
  createShipmentRepo,
  createSupplierRepo,
  createUserLinkRepo,
  createUserRepo,
} from './fixtures/repositories';

export function givenBoundCrudRepositories(
  db: juggler.DataSource,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  Order.definition.properties.id.type = features.idType;
  Address.definition.properties.id.type = features.idType;
  Customer.definition.properties.id.type = features.idType;
  Supplier.definition.properties.id.type = features.idType;
  Contact.definition.properties.id.type = features.idType;
  CreditCard.definition.properties.id.type = features.idType;
  CardInfo.definition.properties.id.type = features.idType;
  Cash.definition.properties.id.type = features.idType;
  CartItem.definition.properties.id.type = features.idType;
  CustomerCartItemLink.definition.properties.id.type = features.idType;
  FreeDelivery.definition.properties.id.type = features.idType;
  HalfPrice.definition.properties.id.type = features.idType;
  CustomerPromotionLink.definition.properties.id.type = features.idType;
  Shipment.definition.properties.id.type = features.idType;
  User.definition.properties.id.type = features.idType;
  UserLink.definition.properties.id.type = features.idType;
  // when running the test suite on MongoDB, we don't really need to setup
  // this config for mongo connector to pass the test.
  // however real-world applications might have such config for MongoDB
  // setting it up to check if it works fine as well
  Contact.definition.properties.stakeholderId.type = features.idType;
  Contact.definition.properties.stakeholderId.mongodb = {
    dataType: 'ObjectID',
  };
  Order.definition.properties.customerId.type = features.idType;
  Order.definition.properties.customerId.mongodb = {
    dataType: 'ObjectID',
  };
  Address.definition.properties.customerId.type = features.idType;
  Address.definition.properties.customerId.mongodb = {
    dataType: 'ObjectID',
  };
  CreditCard.definition.properties.customerId.type = features.idType;
  CreditCard.definition.properties.customerId.mongodb = {
    dataType: 'ObjectID',
  };
  CardInfo.definition.properties.creditCardId.type = features.idType;
  CardInfo.definition.properties.creditCardId.mongodb = {
    dataType: 'ObjectID',
  };
  Cash.definition.properties.customerId.type = features.idType;
  Cash.definition.properties.customerId.mongodb = {
    dataType: 'ObjectID',
  };
  CustomerCartItemLink.definition.properties.customerId.type = features.idType;
  CustomerCartItemLink.definition.properties.customerId.mongodb = {
    dataType: 'ObjectID',
  };
  CustomerPromotionLink.definition.properties.customerId.type = features.idType;
  CustomerPromotionLink.definition.properties.customerId.mongodb = {
    dataType: 'ObjectID',
  };
  UserLink.definition.properties.followerId.type = features.idType;
  UserLink.definition.properties.followerId.mongodb = {
    dataType: 'ObjectID',
  };
  UserLink.definition.properties.followeeId.type = features.idType;
  UserLink.definition.properties.followeeId.mongodb = {
    dataType: 'ObjectID',
  };

  const orderRepoClass = createOrderRepo(repositoryClass);
  const orderRepo: OrderRepository = new orderRepoClass(
    db,
    async () => customerRepo,
    async () => shipmentRepo,
  );
  // register the inclusionResolvers here for orderRepo
  orderRepo.inclusionResolvers.set(
    'customer',
    orderRepo.customer.inclusionResolver,
  );

  const shipmentRepoClass = createShipmentRepo(repositoryClass);
  const shipmentRepo: ShipmentRepository = new shipmentRepoClass(
    db,
    async () => orderRepo,
  );

  shipmentRepo.inclusionResolvers.set(
    'shipmentOrders',
    shipmentRepo.shipmentOrders.inclusionResolver,
  );

  const addressRepoClass = createAddressRepo(repositoryClass);
  const addressRepo: AddressRepository = new addressRepoClass(
    db,
    async () => customerRepo,
  );

  const creditCardRepoClass = createCreditCardRepo(repositoryClass);
  const cashRepoClass = createCashRepo(repositoryClass);
  const creditCardRepo: CreditCardRepository = new creditCardRepoClass(
    db,
    async () => customerRepo,
    async () => cardInfoRepo,
  );

  const cashRepo: CashRepository = new cashRepoClass(
    db,
    async () => customerRepo,
  );
  creditCardRepo.inclusionResolvers.set(
    'customer',
    creditCardRepo.customer.inclusionResolver,
  );
  creditCardRepo.inclusionResolvers.set(
    'cardInfo',
    creditCardRepo.cardInfo.inclusionResolver,
  );
  cashRepo.inclusionResolvers.set(
    'customer',
    cashRepo.customer.inclusionResolver,
  );
  const paymentMethodRepo: {
    [repoType: string]: Getter<typeof repositoryClass.prototype>;
  } = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreditCard: async () => creditCardRepo,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Cash: async () => cashRepo,
  };

  const cardInfoRepoClass = createCardInfoRepo(repositoryClass);
  const cardInfoRepo: CardInfoRepository = new cardInfoRepoClass(
    db,
    async () => creditCardRepo,
  );

  cardInfoRepo.inclusionResolvers.set(
    'creditCard',
    cardInfoRepo.creditCard.inclusionResolver,
  );

  const cartItemRepoClass = createCartItemRepo(repositoryClass);
  const cartItemRepo: CartItemRepository = new cartItemRepoClass(
    db,
    async () => orderRepo,
  );

  cartItemRepo.inclusionResolvers.set(
    'order',
    cartItemRepo.order.inclusionResolver,
  );

  const customerCartItemLinkRepoClass =
    createCustomerCartItemLinkRepo(repositoryClass);
  const customerCartItemLinkRepo: CustomerCartItemLinkRepository =
    new customerCartItemLinkRepoClass(db);

  const freeDeliveryRepoClass = createFreeDeliveryRepo(repositoryClass);
  const freeDeliveryRepo: FreeDeliveryRepository = new freeDeliveryRepoClass(
    db,
  );

  const halfPriceRepoClass = createHalfPriceRepo(repositoryClass);
  const halfPriceRepo: HalfPriceRepository = new halfPriceRepoClass(db);

  const promotionRepo: {
    [repoType: string]: Getter<typeof repositoryClass.prototype>;
  } = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    FreeDelivery: async () => freeDeliveryRepo,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    HalfPrice: async () => halfPriceRepo,
  };

  const customerPromotionLinkRepoClass =
    createCustomerPromotionLinkRepo(repositoryClass);
  const customerPromotionLinkRepo: CustomerPromotionLinkRepository =
    new customerPromotionLinkRepoClass(db);

  const userRepoClass = createUserRepo(repositoryClass);
  const userRepo: UserRepository = new userRepoClass(
    db,
    async () => userLinkRepo,
  );

  const userLinkRepoClass = createUserLinkRepo(repositoryClass);
  const userLinkRepo: UserLinkRepository = new userLinkRepoClass(db);

  userRepo.inclusionResolvers.set('users', userRepo.users.inclusionResolver);

  const supplierRepoClass = createSupplierRepo(repositoryClass);
  const supplierRepo: SupplierRepository = new supplierRepoClass(
    db,
    async () => contactRepo,
  );

  // get the repository class and create a new instance of it
  const customerRepoClass = createCustomerRepo(repositoryClass);

  const customerRepo: CustomerRepository = new customerRepoClass(
    db,
    async () => orderRepo,
    async () => addressRepo,
    async () => cartItemRepo,
    async () => customerCartItemLinkRepo,
    promotionRepo,
    async () => customerPromotionLinkRepo,
    paymentMethodRepo,
    async () => contactRepo,
  );

  const stakeholderRepo: {
    [repoType: string]: Getter<typeof repositoryClass.prototype>;
  } = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Customer: async () => customerRepo,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Supplier: async () => supplierRepo,
  };

  const contactRepoClass = createContactRepo(repositoryClass);
  const contactRepo: ContactRepository = new contactRepoClass(
    db,
    stakeholderRepo,
  );

  contactRepo.inclusionResolvers.set(
    'stakeholder',
    contactRepo.stakeholder.inclusionResolver,
  );

  // register the inclusionResolvers here for customerRepo
  customerRepo.inclusionResolvers.set(
    'orders',
    customerRepo.orders.inclusionResolver,
  );
  customerRepo.inclusionResolvers.set(
    'customers',
    customerRepo.customers.inclusionResolver,
  );
  customerRepo.inclusionResolvers.set(
    'address',
    customerRepo.address.inclusionResolver,
  );
  customerRepo.inclusionResolvers.set(
    'cartItems',
    customerRepo.cartItems.inclusionResolver,
  );
  customerRepo.inclusionResolvers.set(
    'promotions',
    customerRepo.promotions.inclusionResolver,
  );
  customerRepo.inclusionResolvers.set(
    'paymentMethod',
    customerRepo.paymentMethod.inclusionResolver,
  );
  customerRepo.inclusionResolvers.set(
    'contact',
    customerRepo.contact.inclusionResolver,
  );
  supplierRepo.inclusionResolvers.set(
    'contact',
    supplierRepo.contact.inclusionResolver,
  );

  return {
    customerRepo,
    orderRepo,
    shipmentRepo,
    addressRepo,
    cartItemRepo,
    customerCartItemLinkRepo,
    freeDeliveryRepo,
    halfPriceRepo,
    customerPromotionLinkRepo,
    userRepo,
    userLinkRepo,
    creditCardRepo,
    cashRepo,
    contactRepo,
    supplierRepo,
    cardInfoRepo,
  };
}
