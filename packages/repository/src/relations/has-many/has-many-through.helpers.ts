import {DataObject, Entity, HasManyThroughDefinition} from '../..';

export type HasManyThroughResolvedDefinition = HasManyThroughDefinition;

/**
 * Creates constraint used to query target
 * @param relationMeta - hasManyThrough metadata to resolve
 * @param throughInstances - Instances of through entities used to constrain the target
 * @internal
 */
export function createTargetConstraint<
  Target extends Entity,
  Through extends Entity
>(
  relationMeta: HasManyThroughResolvedDefinition,
  throughInstances: Through[],
): DataObject<Target> {
  throw new Error('Not implemented');
}

/**
 * Creates constraint used to query through
 * @param relationMeta - hasManyThrough metadata to resolve
 * @param fkValue - Value of the foreign key used to constrain through
 * @param targetInstance - Instance of target entity used to constrain through
 * @internal
 */
export function createThroughConstraint<
  Target extends Entity,
  Through extends Entity,
  ForeignKeyType
>(
  relationMeta: HasManyThroughResolvedDefinition,
  fkValue?: ForeignKeyType,
  targetInstance?: Target,
): DataObject<Through> {
  throw new Error('Not implemented');
}

/**
 * Resolves given hasMany metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * belongsTo metadata
 * @param relationMeta - hasManyThrough metadata to resolve
 * @internal
 */
export function resolveHasManyThroughMetadata(
  relationMeta: HasManyThroughDefinition,
): HasManyThroughResolvedDefinition {
  throw new Error('Not implemented');
}
