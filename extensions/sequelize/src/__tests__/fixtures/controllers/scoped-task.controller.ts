import {repository} from '@loopback/repository';
import {get, response} from '@loopback/rest';
import {ScopedTaskRepository} from '../repositories';
import {TestControllerBase} from './test.controller.base';

export class ScopedTaskController extends TestControllerBase {
  constructor(
    @repository(ScopedTaskRepository)
    public scopedTaskRepository: ScopedTaskRepository,
  ) {
    super(scopedTaskRepository);
  }

  @get('/scoped-tasks/sync-sequelize-model')
  @response(200)
  async syncSequelizeModel(): Promise<void> {
    await this.beforeEach();
  }
}
