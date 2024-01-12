import {Filter, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {Roles} from '../models';
import {RolesRepository} from '../repositories';
import {TestControllerBase} from './test.controller.base';

export class RolesController extends TestControllerBase {
  constructor(
    @repository(RolesRepository)
    public roleRepository: RolesRepository,
  ) {
    super(roleRepository);
  }

  @post('/role')
  @response(200, {
    description: 'Role model instance',
    content: {'application/json': {schema: getModelSchemaRef(Roles)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Roles, {
            title: 'NewRole',
            exclude: ['id'],
          }),
        },
      },
    })
    role: Omit<Roles, 'id'>,
  ): Promise<Roles> {
    return this.roleRepository.create(role);
  }

  @get('/roles')
  @response(200, {
    description: 'Role model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Roles, {includeRelations: true}),
      },
    },
  })
  async getRoles(
    @param.filter(Roles) filter?: Filter<Roles>,
  ): Promise<Roles[]> {
    return this.roleRepository.find(filter);
  }

  @get('/roles/sync-sequelize-model')
  @response(200)
  async syncSequelizeModel(): Promise<void> {
    await this.beforeEach();
  }
}
