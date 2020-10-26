import _ from 'lodash';
import {
  DeepPartial,
  Entity,
  EntityResolver,
  HasAndBelongsToManyDefinition,
  relation,
  RelationType,
} from '../..';

export function hasAndBelongsToMany<TH extends Entity, TA extends Entity>(
  throughResolver: EntityResolver<TH>,
  targetResolver: EntityResolver<TA>,
  definition?: DeepPartial<HasAndBelongsToManyDefinition>,
) {
  return function (decoratedTarget: object, key: string) {
    const meta: HasAndBelongsToManyDefinition = _.merge(
      // Default values, can be customized by the caller
      {name: key},
      // Properties provided by the caller
      definition,
      // Properties enforced by the decorator
      {
        type: RelationType.hasAndBelongsToMany,
        targetsMany: true,
        source: decoratedTarget.constructor,
        target: targetResolver,
        through: {
          model: throughResolver,
        },
      },
      // FixMe(frbuceta): needed when using DeepPartial and _.merge
    ) as HasAndBelongsToManyDefinition;
    relation(meta)(decoratedTarget, key);
  };
}
