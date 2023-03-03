import {AnyObject} from '@loopback/repository';
import {SyncOptions} from 'sequelize';

export abstract class TestControllerBase {
  repositories: AnyObject[];
  constructor(...repositories: AnyObject[]) {
    this.repositories = repositories;
  }

  /**
   * `beforeEach` is only for testing purposes in the controller,
   * Calling `syncSequelizeModel` ensures that corresponding table
   * exists before calling the function. In real project you are supposed
   * to run migrations instead, to sync model definitions to the target database.
   */
  async beforeEach(options: {syncAll?: boolean} = {}) {
    const syncOptions: SyncOptions = {force: true};

    for (const repository of this.repositories as AnyObject[]) {
      if (options.syncAll) {
        await repository.syncLoadedSequelizeModels(syncOptions);
        continue;
      }
      await repository.syncSequelizeModel(syncOptions);
    }
  }
}
