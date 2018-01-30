import 'mocha';
import { AccountController } from '../../controllers/AccountController';
import { expect } from '@loopback/testlab';
import { AccountRepository } from '../../repositories/account';

let testController: any;

const testAcc = {
  id: 'test1',
  customerNumber: '1234',
  balance: 1000,
  branch: 'Toronto',
  type: 'Chequing',
  avgBalance: 500,
  minimumBalance: 0
};

const brokenAcc = {
  customerNumber: '123456',
  balance: 1000,
  branch: 'Broke City',
  type: 'Chequing'
};

describe('AccountController Unit Test Suite', () => {
  before(createAccountController);

  it('creates an account instance', async () => {
    const result = await testController.createAccount(testAcc);
    expect(result).to.deepEqual(testAcc);
    const getResult = await testController.getAccount('{"where":{"id":"test1"}}');
    expect(getResult).to.not.be.empty();
    expect(getResult).have.lengthOf(1);
    expect(getResult[0]).to.deepEqual(testAcc);
  });
  it('should not create an invalid instance', async () => {
    try {
      await testController.createAccount(brokenAcc);
    } catch (err) {
      expect(err).to.not.be.empty();
    }
  });
  it('should not accept invalid args', async () => {
    try {
      await testController.getAccount('');
    } catch (err) {
      expect(err).to.not.be.empty();
    }
  });

  it('updates an account instance', async () => {
    const result = await testController.updateAccount('{"id":"test1"}}', {
      balance: 2000
    });
    expect(result.count).to.be.equal(1);
    const getResult = await testController.getAccount('{"where":{"id":"test1"}}');
    expect(getResult).to.not.be.empty();
    expect(getResult).have.lengthOf(1);
    expect(getResult[0].id).to.be.equal(testAcc.id);
    expect(getResult[0].toObject().balance).to.be.equal(2000);
  });

  it('deletes an account instance', async () => {
    const result = await testController.deleteAccount('{"id":"test1"}}');
    expect(result.count).to.be.equal(1);
    const getResult = await testController.getAccount('{"where":{"id":"test1"}}');
    expect(getResult).to.be.empty();
  });
});

function createAccountController() {
  testController = new AccountController();
  testController.repository = new AccountRepository();
}
