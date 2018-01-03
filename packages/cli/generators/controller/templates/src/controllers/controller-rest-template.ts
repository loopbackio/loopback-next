import {Filter, Where} from '@loopback/repository';
import {post, param, get, put, patch, del} from '@loopback/openapi-v2';
import {inject} from '@loopback/context';
import {<%= modelName %>} from '../models';
import {<%= repositoryName %>} from '../repositories';

export class <%= name %>Controller {

  constructor(
    @inject('repositories.<%= modelNameCamel %>')
    public <%= repositoryNameCamel %> : <%= repositoryName %>,
  ) {}

  @post('/<%= modelNameCamel %>')
  @param.body('obj', <%= modelName %>)
  async create(obj: <%= modelName %>) : Promise<<%= modelName %>> {
    return await this.<%= repositoryNameCamel %>.create(obj);
  }

  @get('/<%= modelNameCamel %>/count')
  @param.query.string('where')
  async count(where: Where) : Promise<number> {
    return await this.<%= repositoryNameCamel %>.count(where);
  }

  @get('/<%= modelNameCamel %>')
  @param.query.string('filter')
  async find(filter: Filter) : Promise<<%= modelName %>[]> {
    return await this.<%= repositoryNameCamel %>.find(filter);
  }

  @patch('/<%= modelNameCamel %>')
  @param.query.string('where')
  @param.body('obj', <%= modelName %>)
  async updateAll(where: Where, obj: <%= modelName %>) : Promise<number> {
    return await this.<%= repositoryNameCamel %>.updateAll(where, obj);
  }

  @del('/<%= modelNameCamel %>')
  @param.query.string('where')
  async deleteAll(where: Where) : Promise<number> {
    return await this.<%= repositoryNameCamel %>.deleteAll(where);
  }

  @get('/<%= modelNameCamel %>/{id}')
  async findById(id: <%= idType %>) : Promise<<%= modelName %>> {
    return await this.<%= repositoryNameCamel %>.findById(id);
  }

  @patch('/<%= modelNameCamel %>/{id}')
  @param.body('obj', <%= modelName %>)
  async updateById(id: <%= idType %>, obj: <%= modelName %>) : Promise<boolean> {
    return await this.<%= repositoryNameCamel %>.updateById(id, obj);
  }

  @del('/<%= modelNameCamel %>/{id}')
  async deleteById(id: <%= idType %>) : Promise<boolean> {
    return await this.<%= repositoryNameCamel %>.deleteById(id);
  }
}
