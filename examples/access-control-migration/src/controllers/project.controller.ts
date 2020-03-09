// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-access-control-migration
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param, patch} from '@loopback/rest';
import _ from 'lodash';
import {assignProjectInstanceId} from '../components/casbin-authorization';
import {Project} from '../models';
import {ProjectRepository} from '../repositories';

// TBD: refactor the ACLs to a separate file
const RESOURCE_NAME = 'project';
const ACL_PROJECT = {
  'view-all': {
    resource: `${RESOURCE_NAME}*`,
    scopes: ['view-all'],
    allowedRoles: ['admin'],
  },
  'show-balance': {
    resource: RESOURCE_NAME,
    scopes: ['show-balance'],
    allowedRoles: ['owner', 'team'],
    voters: [assignProjectInstanceId],
  },
  donate: {
    resource: RESOURCE_NAME,
    scopes: ['donate'],
    allowedRoles: ['admin', 'owner', 'team'],
    voters: [assignProjectInstanceId],
  },
  withdraw: {
    resource: RESOURCE_NAME,
    scopes: ['withdraw'],
    allowedRoles: ['owner'],
    voters: [assignProjectInstanceId],
  },
};

// TODO: add other CRUD methods and corresponding ACL
export class ProjectController {
  constructor(
    @repository(ProjectRepository)
    public projectRepository: ProjectRepository,
  ) {}

  // LIST PROJECTS (balance is not public)
  @get('/list-projects', {
    responses: {
      '200': {
        description: 'List all the project model instances without balance',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Project, {
                title: 'ProjectPublic',
                exclude: ['balance'],
              }),
            },
          },
        },
      },
    },
  })
  async listProjects(): Promise<Omit<Project, 'balance'>[]> {
    const projects = await this.projectRepository.find();
    return projects.map(p => _.omit(p, 'balance'));
  }

  // VIWE ALL PROJECTS (including balance)
  @get('/view-all-projects', {
    responses: {
      '200': {
        description: 'Array of all Project model instances including balance',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Project),
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize(ACL_PROJECT['view-all'])
  async viewAll(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  // SHOW BALANCE: get project by id
  @get('/projects/{id}/show-balance', {
    responses: {
      '200': {
        description: 'show balance of a project',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Project),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize(ACL_PROJECT['show-balance'])
  async findById(@param.path.number('id') id: number): Promise<Project> {
    return this.projectRepository.findById(id);
  }

  // DONATE BY ID
  @patch('/projects/{id}/donate', {
    responses: {
      '204': {
        description: 'Project donate success',
      },
    },
  })
  @authenticate('jwt')
  @authorize(ACL_PROJECT.donate)
  async donateById(
    @param.path.number('id') id: number,
    @param.query.number('amount') amount: number,
  ): Promise<void> {
    const project = await this.projectRepository.findById(id);
    await this.projectRepository.updateById(id, {
      balance: project.balance + amount,
    });
    // TBD: return new balance
  }

  // WITHDRAW BY ID
  @patch('/projects/{id}/withdraw', {
    responses: {
      '204': {
        description: 'Project withdraw success',
      },
    },
  })
  @authenticate('jwt')
  @authorize(ACL_PROJECT.withdraw)
  async withdrawById(
    @param.path.number('id') id: number,
    @param.query.number('amount') amount: number,
  ): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (project.balance < amount) {
      throw new Error('Balance is not enough.');
    }
    await this.projectRepository.updateById(id, {
      balance: project.balance - amount,
    });
    // TBD: return new balance
  }
}
