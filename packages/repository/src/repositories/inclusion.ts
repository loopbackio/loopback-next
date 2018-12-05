import {Entity} from '../model';
import {Getter} from '@loopback/core';
import {
  Filter,
  Where,
  resolveHasManyMetadata,
  resolveBelongsToMetadata,
  RelationMetadata,
  RelationType,
  constrainWhere,
} from '../';
import {AnyObject} from '..';
import {DefaultCrudRepository} from './legacy-juggler-bridge';
import {inspect} from 'util';
import {
  HasManyDefinition,
  BelongsToDefinition,
  HasManyResolvedDefinition,
  BelongsToResolvedDefinition,
} from '../relations';

type ResolvedRelationMetadata =
  | HasManyResolvedDefinition
  | BelongsToResolvedDefinition;

// SE: the source entity
// TE: the target entity
// SID: the ID of source entity
// TID: the ID of target entity

export class InclusionHandler<SE extends Entity, SID> {
  _handlers: {[relation: string]: Function} = {};
  constructor(public sourceRepository: DefaultCrudRepository<SE, SID>) {}

  registerHandler<TE extends Entity, TID>(
    relationName: string,
    targetRepoGetter: Getter<DefaultCrudRepository<TE, TID>>,
  ) {
    this._handlers[relationName] = fetchIncludedItems;
    const self = this;

    async function fetchIncludedItems(
      fks: SID[],
      filter?: Filter<TE>,
    ): Promise<TE[]> {
      const targetRepo = await targetRepoGetter();
      const relationDef: ResolvedRelationMetadata = self.getResolvedRelationDefinition(
        relationName,
      );
      filter = filter || {};
      filter.where = self.buildConstrainedWhere<TE>(
        fks,
        filter.where || {},
        relationDef,
      );
      console.log(`inclusion filter: ${inspect(filter)}`);

      return await targetRepo.find(filter);
    }
  }

  findHandler(relationName: string) {
    const errMsg =
      `The inclusion handler for relation ${relationName} is not found!` +
      `Make sure you defined ${relationName} properly.`;

    return this._handlers[relationName] || new Error(errMsg);
  }

  buildConstrainedWhere<TE extends Entity>(
    ids: SID[],
    whereFilter: Where<TE>,
    relationDef: ResolvedRelationMetadata,
  ): Where<TE> {
    const keyPropName: string = relationDef.keyTo;
    const where: AnyObject = {};
    where[keyPropName] = {inq: ids};
    return constrainWhere(whereFilter, where as Where<TE>);
  }

  getResolvedRelationDefinition(name: string): ResolvedRelationMetadata {
    const relationMetadata: RelationMetadata = this.sourceRepository.entityClass
      .definition.relations[name];

    switch (relationMetadata.type) {
      case RelationType.hasMany:
        return resolveHasManyMetadata(relationMetadata as HasManyDefinition);
      case RelationType.belongsTo:
        return resolveBelongsToMetadata(
          relationMetadata as BelongsToDefinition,
        );
      default:
        throw new Error(`Unsupported relation type ${relationMetadata.type}`);
    }
  }
}
