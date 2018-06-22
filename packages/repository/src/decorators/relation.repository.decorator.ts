import {Entity} from '../model';
import {EntityCrudRepository} from '../repositories/repository';
import {Class} from '../common-types';
import {createHasManyRepositoryFactory} from '../repositories/relation.factory';
import {inject, BindingKey, Context, Injection} from '@loopback/context';
import {DataSource} from 'loopback-datasource-juggler';

/**
 * Decorator for hasMany
 * @param targetRepo
 * @returns {(target:any, key:string)}
 */
export function hasManyRepository<T extends Entity>(
  targetRepo: Class<EntityCrudRepository<T, typeof Entity.prototype.id>>,
) {
  // tslint:disable-next-line:no-any
  return function(target: any, key: string, index: number) {
    inject(
      BindingKey.create<typeof targetRepo>(`repositories.${targetRepo.name}`),
      {sourceRepo: target},
      resolver,
    )(target, key, index);
  };

  async function resolver(ctx: Context, injection: Injection) {
    const tRepo = await ctx.get<
      EntityCrudRepository<T, typeof Entity.prototype.id>
    >(injection.bindingKey);

    /**
     * discussion point: use a fake DataSource instance so that we can get back
     * the source model possible alternatives we considered:
     *  - use context to resolve an instance of the source repository and thus a
     *    source model (results in circular dependency between related
     *    repositories)
     *  - change UX so that users pass in the source model manually
     *    (inconvenient)
     *  - enforce binding of models to application context, so that it can be
     *    retrieved
     */

    const fakeDs = new DataSource();
    const sourceModel = new injection.metadata!.sourceRepo(fakeDs).entityClass;
    return createHasManyRepositoryFactory(sourceModel, tRepo);
  }
}
