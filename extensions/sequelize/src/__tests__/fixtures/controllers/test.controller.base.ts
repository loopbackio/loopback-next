import {AnyObject} from '@loopback/repository';
import {SyncOptions} from 'sequelize';

export abstract class TestControllerBase {
  constructor(public repository: AnyObject) {}

  /**
   * `beforeEach` is only for testing purposes in the controller,
   * Calling `syncSequelizeModel` ensures that corresponding table
   * exists before calling the function. In real project you are supposed
   * to run migrations instead, to sync model definitions to the target database.
   */
  async beforeEach(options: {syncAll?: boolean} = {}) {
    const syncOptions: SyncOptions = {force: false};

    if (options.syncAll) {
      await this.repository.syncLoadedSequelizeModels(syncOptions);
      return;
    }
    await this.repository.syncSequelizeModel(syncOptions);
  }
}
