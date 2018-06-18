import {Entity} from '../model';
import {EntityCrudRepository} from '../repositories/repository';
import {Class} from '../common-types';
import {
  HasManyDefinition,
  hasManyRepositoryFactory,
  RelationDefinitionBase,
  getConstrainedRepositoryFunction,
} from '../repositories/relation.factory';
import {RelationType, RELATIONS_KEY} from './relation.decorator';
import {
  inject,
  BindingKey,
  Context,
  Injection,
  MetadataInspector,
} from '@loopback/context';
import {DefaultCrudRepository} from '../repositories/legacy-juggler-bridge';

/**
 * Decorator for hasMany
 * @param targetRepo
 * @returns {(target:any, key:string)}
 */
export function hasManyRepository<T extends Entity>(
  targetRepo: Class<EntityCrudRepository<T, typeof Entity.prototype.id>>,
) {
  // tslint:disable-next-line:no-any
  return function(target: Object, key: string) {
    inject(
      BindingKey.create<typeof targetRepo>(`repositories.${targetRepo.name}`),
      {sourceRepo: target.constructor},
      resolver,
    )(target, key);
  };

  async function resolver(ctx: Context, injection: Injection) {
    const tRepo = await ctx.get<
      DefaultCrudRepository<Entity, typeof Entity.prototype.id>
    >(injection.bindingKey);
    const sourceModel = new injection.metadata!.sourceRepo().entityClass;
    // return function<S extends Entity>(constraint: Partial<S>) {
    //   return hasManyRepositoryFactory(
    //     constraint[meta.keyFrom],
    //     meta,
    //     tRepo as DefaultCrudRepository<Entity, typeof Entity.prototype.id>,
    //   );
    // };
    return getConstrainedRepositoryFunction(sourceModel, tRepo);
  }
}
