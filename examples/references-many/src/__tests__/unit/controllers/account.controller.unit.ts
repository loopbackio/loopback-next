// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-account-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {AccountController} from '../../../controllers';
import {Account} from '../../../models';
import {AccountRepository} from '../../../repositories';
import {givenAccount} from '../../helpers';

describe('AccountController', () => {
  let accountRepo: StubbedInstanceWithSinonAccessor<AccountRepository>;

  /*
  =============================================================================
  TEST VARIABLES
  Combining top-level objects with our resetRepositories method means we don't
  need to duplicate several variable assignments (and generation statements)
  in all of our test logic.

  NOTE: If you wanted to parallelize your test runs, you should avoid this
  pattern since each of these tests is sharing references.
  =============================================================================
  */
  let controller: AccountController;
  let aAccount: Account;
  let aAccountWithId: Account;
  let aChangedAccount: Account;
  let aListOfAccounts: Account[];

  beforeEach(resetRepositories);

  describe('createAccount', () => {
    it('creates a Account', async () => {
      const create = accountRepo.stubs.create;
      create.resolves(aAccountWithId);
      const result = await controller.create(aAccount);
      expect(result).to.eql(aAccountWithId);
      sinon.assert.calledWith(create, aAccount);
    });
  });

  describe('findAccountById', () => {
    it('returns a account if it exists', async () => {
      const findById = accountRepo.stubs.findById;
      findById.resolves(aAccountWithId);
      expect(await controller.findById(aAccountWithId.id as number)).to.eql(
        aAccountWithId,
      );
      sinon.assert.calledWith(findById, aAccountWithId.id);
    });
  });

  describe('findAccounts', () => {
    it('returns multiple accounts if they exist', async () => {
      const find = accountRepo.stubs.find;
      find.resolves(aListOfAccounts);
      expect(await controller.find()).to.eql(aListOfAccounts);
      sinon.assert.called(find);
    });

    it('returns empty list if no accounts exist', async () => {
      const find = accountRepo.stubs.find;
      const expected: Account[] = [];
      find.resolves(expected);
      expect(await controller.find()).to.eql(expected);
      sinon.assert.called(find);
    });
  });

  describe('replaceAccount', () => {
    it('successfully replaces existing items', async () => {
      const replaceById = accountRepo.stubs.replaceById;
      replaceById.resolves();
      await controller.replaceById(
        aAccountWithId.id as number,
        aChangedAccount,
      );
      sinon.assert.calledWith(replaceById, aAccountWithId.id, aChangedAccount);
    });
  });

  describe('updateAccount', () => {
    it('successfully updates existing items', async () => {
      const updateById = accountRepo.stubs.updateById;
      updateById.resolves();
      await controller.updateById(aAccountWithId.id as number, aChangedAccount);
      sinon.assert.calledWith(updateById, aAccountWithId.id, aChangedAccount);
    });
  });

  describe('deleteAccount', () => {
    it('successfully deletes existing items', async () => {
      const deleteById = accountRepo.stubs.deleteById;
      deleteById.resolves();
      await controller.deleteById(aAccountWithId.id as number);
      sinon.assert.calledWith(deleteById, aAccountWithId.id);
    });
  });

  function resetRepositories() {
    accountRepo = createStubInstance(AccountRepository);
    aAccount = givenAccount();
    aAccountWithId = givenAccount({
      id: 1,
    });
    aListOfAccounts = [
      aAccountWithId,
      givenAccount({
        id: 2,
        balance: 5,
      }),
    ] as Account[];
    aChangedAccount = givenAccount({
      id: aAccountWithId.id,
      balance: 10,
    });

    controller = new AccountController(accountRepo);
  }
});
