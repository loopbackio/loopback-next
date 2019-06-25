// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  AnyObject,
  DefaultCrudRepository,
  Entity,
  EntityCrudRepository,
  Filter,
  HasManyDefinition,
  HasManyRepositoryFactory,
  HasManyResolvedDefinition,
  HasOneRepositoryFactory,
  Inclusion,
  juggler,
  Options,
  repository,
  resolveHasManyMetadata,
} from '@loopback/repository';
import {Todo, TodoList, TodoListImage, TodoListRelations} from '../models';
import {TodoListImageRepository} from './todo-list-image.repository';
import {TodoRepository} from './todo.repository';

export class TodoListRepository extends DefaultCrudRepository<
  TodoList,
  typeof TodoList.prototype.id,
  TodoListRelations
> {
  public readonly todos: HasManyRepositoryFactory<
    Todo,
    typeof TodoList.prototype.id
  >;
  public readonly image: HasOneRepositoryFactory<
    TodoListImage,
    typeof TodoList.prototype.id
  >;

  protected _inclusions: {[key: string]: InclusionResolver};

  constructor(
    @inject('datasources.db') dataSource: juggler.DataSource,
    @repository.getter('TodoRepository')
    protected todoRepositoryGetter: Getter<TodoRepository>,
    @repository.getter('TodoListImageRepository')
    protected todoListImageRepositoryGetter: Getter<TodoListImageRepository>,
  ) {
    super(TodoList, dataSource);
    this.todos = this.createHasManyRepositoryFactoryFor(
      'todos',
      todoRepositoryGetter,
    );
    this.image = this.createHasOneRepositoryFactoryFor(
      'image',
      todoListImageRepositoryGetter,
    );

    this._inclusions = Object.create(null);
    this._inclusions.todo = new HasManyInclusionResolver(
      this.entityClass.definition.relations.todos as HasManyDefinition,
      this.todoRepositoryGetter,
    );
  }

  public findByTitle(title: string) {
    return this.findOne({where: {title}});
  }

  protected async includeRelatedModels(
    entities: TodoList[],
    filter?: Filter<TodoList>,
    _options?: Options,
  ): Promise<(TodoList & TodoListRelations)[]> {
    const result = entities as (TodoList & TodoListRelations)[];

    const include = filter && filter.include;
    if (!include) return result;

    const invalidInclusions = include.filter(
      this.isInclusionAllowed.bind(this),
    );
    if (invalidInclusions.length) {
      const msg =
        'Invalid "filter.include" entries: ' +
        invalidInclusions.map(i => JSON.stringify(i)).join('; ');
      const err = new Error(msg);
      Object.assign(err, {
        code: 'INVALID_INCLUSION_FILTER',
      });
      throw err;
    }

    const resolveTasks = include.map(i => {
      const relationName = i.relation!;
      const handler = this._inclusions[relationName];
      return handler.fetchIncludedModels(entities, i);
    });

    await Promise.all(resolveTasks);

    return result;
  }

  private isInclusionAllowed(inclusion: Inclusion) {
    const relationName = inclusion.relation;
    const allowed =
      relationName &&
      Object.prototype.hasOwnProperty.call(this._inclusions, relationName);
    return allowed;
  }
}

interface InclusionResolver {
  fetchIncludedModels<SourceWithRelations extends Entity>(
    entities: SourceWithRelations[],
    inclusion: Inclusion,
  ): Promise<void>;
}

class HasManyInclusionResolver<
  Target extends Entity,
  TargetID,
  TargetRelations extends object
> implements InclusionResolver {
  protected relationMeta: HasManyResolvedDefinition;

  constructor(
    relationMeta: HasManyDefinition,
    protected getTargetRepo: Getter<
      EntityCrudRepository<Target, TargetID, TargetRelations>
    >,
  ) {
    this.relationMeta = resolveHasManyMetadata(relationMeta);
  }

  async fetchIncludedModels<SourceWithRelations extends Entity>(
    entities: SourceWithRelations[],
    inclusion: Inclusion,
  ): Promise<void> {
    // TODO(bajtos) reject unsupported inclusion options, e.g. "scope"

    const sourceIds = entities.map(e => e.getId());
    const targetKey = this.relationMeta.keyTo;

    // TODO(bajtos) take into account filter fields like pagination
    const targetFilter = {
      [targetKey]: {
        inq: sourceIds,
      },
    };

    // TODO(bajtos) split the query into multiple smaller ones
    // when inq size is large
    const targetRepo = await this.getTargetRepo();
    const found = await targetRepo.find(targetFilter);

    // TODO(bajtos) Extract this code into a shared helper
    // Build a lookup map sourceId -> target entity
    const lookup = new Map<TargetID, (Target & TargetRelations)[]>();
    for (const target of found) {
      const fk: TargetID = (target as AnyObject)[targetKey];
      const val = lookup.get(fk) || [];
      val.push(target);
      lookup.set(fk, val);
    }

    for (const source of entities) {
      const targets = lookup.get(source.getId());
      if (!targets) continue;
      const sourceKey = this.relationMeta.name as keyof SourceWithRelations;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      source[sourceKey] = targets as any;
    }
  }
}
