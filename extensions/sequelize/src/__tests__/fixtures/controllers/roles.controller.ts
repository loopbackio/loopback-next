import {AnyObject, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
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

  @get('/roles-desc')
  @response(200, {
    description: 'Role model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Roles, {includeRelations: true}),
      },
    },
  })
  async getRolesByDesc(): Promise<Roles[]> {
    return this.roleRepository.find({
      where: {
        description: {match: 'Others'},
      } as AnyObject,
    });
  }

  @get('/roles-perm')
  @response(200, {
    description: 'Role model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Roles, {includeRelations: true}),
      },
    },
  })
  async getRolesByPermission(): Promise<Roles[]> {
    return this.roleRepository.find({
      where: {
        permissions: {contains: ['View']},
      },
    } as AnyObject);
  }

  @get('/roles/sync-sequelize-model')
  @response(200)
  async syncSequelizeModel(): Promise<void> {
    await this.beforeEach();
  }
}
