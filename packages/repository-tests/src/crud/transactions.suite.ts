// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  IsolationLevel,
  juggler,
  model,
  property,
  Transaction,
  TransactionalEntityRepository,
} from '@loopback/repository';
import {expect, skipIf, toJSON} from '@loopback/testlab';
import {Suite} from 'mocha';
import {MixedIdType, withCrudCtx} from '../helpers.repository-tests';
import {
  CrudFeatures,
  CrudTestContext,
  DataSourceOptions,
  TransactionalRepositoryCtor,
} from '../types.repository-tests';

// Core scenarios for testing CRUD functionalities of Transactional connectors
// Please keep this file short, put any advanced scenarios to other files
/* istanbul ignore file */
export function transactionSuite(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: TransactionalRepositoryCtor,
  connectorFeatures: CrudFeatures,
) {
  skipIf<[(this: Suite) => void], void>(
    !connectorFeatures.supportsTransactions,
    describe,
    `transactions`,
    () => {
      @model()
      class Product extends Entity {
        @property({
          type: connectorFeatures.idType,
          id: true,
          generated: true,
          description: 'The unique identifier for a product',
        })
        id: MixedIdType;

        @property({type: 'string', required: true})
        name: string;

        constructor(data?: Partial<Product>) {
          super(data);
        }
      }

      describe('create-retrieve with transactions', () => {
        let repo: TransactionalEntityRepository<
          Product,
          typeof Product.prototype.id
        >;
        let tx: Transaction | undefined;
        let ds: juggler.DataSource;
        let ds2: juggler.DataSource;

        before(
          withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
            ds = ctx.dataSource;
            repo = new repositoryClass(Product, ds);
            await ds.automigrate(Product.name);
          }),
        );
        beforeEach(() => {
          tx = undefined;
        });
        afterEach(async () => {
          // For postgresql connector, it doesn't wrap the connection with
          // the Transaction that has juggler's Transaction mixin applied,
          // therefore `commit` or `rollback` won't delete the connection's
          // reference of a `tx`.
          // Detailed explanation see:
          // https://github.com/strongloop/loopback-next/pull/4474
          if (ds.connector?.name === 'postgresql') {
            tx = undefined;
          }
          if (tx?.isActive()) {
            await tx.rollback();
          }
        });

        afterEach(async () => {
          if (ds2) {
            ds2.disconnect();
            (ds2 as unknown) = undefined;
          }
        });

        it('retrieves model instance once transaction is committed', async () => {
          tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
          const created = await repo.create(
            {name: 'Pencil'},
            {transaction: tx},
          );
          expect(created.toObject()).to.have.properties('id', 'name');
          expect(created.id).to.be.ok();

          await tx.commit();
          const foundOutsideTransaction = await repo.findById(created.id, {});
          expect(toJSON(created)).to.deepEqual(toJSON(foundOutsideTransaction));
        });

        it('can rollback transaction', async () => {
          tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

          const created = await repo.create(
            {name: 'Pencil'},
            {transaction: tx},
          );
          expect(created.toObject()).to.have.properties('id', 'name');
          expect(created.id).to.be.ok();

          const foundInsideTransaction = await repo.findById(
            created.id,
            {},
            {
              transaction: tx,
            },
          );
          expect(toJSON(created)).to.deepEqual(toJSON(foundInsideTransaction));
          await tx.rollback();
          await expect(repo.findById(created.id, {})).to.be.rejectedWith({
            code: 'ENTITY_NOT_FOUND',
          });
        });

        it('ensures transactions are isolated', async () => {
          tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
          const created = await repo.create(
            {name: 'Pencil'},
            {transaction: tx},
          );
          expect(created.toObject()).to.have.properties('id', 'name');
          expect(created.id).to.be.ok();

          const foundInsideTransaction = await repo.findById(
            created.id,
            {},
            {
              transaction: tx,
            },
          );
          expect(toJSON(created)).to.deepEqual(toJSON(foundInsideTransaction));
          await expect(repo.findById(created.id, {})).to.be.rejectedWith({
            code: 'ENTITY_NOT_FOUND',
          });
        });

        it('should not use transaction with another repository', async () => {
          const ds2Options = Object.assign({}, dataSourceOptions);
          ds2Options.name = 'anotherDataSource';
          ds2Options.database = ds2Options.database + '_new';
          ds2 = new juggler.DataSource(ds2Options);
          const anotherRepo = new repositoryClass(Product, ds2);
          await ds2.automigrate(Product.name);

          tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

          // we should reject this call with a clear error message
          // stating that transaction doesn't belong to the repository
          // and that only local transactions are supported
          // expect(
          //   await anotherRepo.create({name: 'Pencil'}, {transaction: tx}),
          // ).to.throw(/some error/);
          // see https://github.com/strongloop/loopback-next/issues/3483
          const created = await anotherRepo.create(
            {name: 'Pencil'},
            {transaction: tx},
          );
          expect(created.toObject()).to.have.properties('id', 'name');
          expect(created.id).to.be.ok();

          // for now, LB ignores the transaction so the instance
          // should be created regardless
          await tx.rollback();
          const foundOutsideTransaction = await anotherRepo.findById(
            created.id,
            {},
          );
          expect(toJSON(created)).to.deepEqual(toJSON(foundOutsideTransaction));
        });
      });
    },
  );
}
