import {RelationMetadata, RelationType} from '../relations';

/**
 * @experimental
 */
export class StrongRelationMandateNotGuaranteedError<
  Props extends object = {}
> extends Error {
  code: string;
  reason: string;
  relationName: string;
  relationType: RelationType;
  sourceModelName: string;

  constructor(
    reason: string,
    relationMeta: RelationMetadata,
    extraProperties?: Props,
  ) {
    const {name, type, source} = relationMeta;
    const model = source?.modelName || '<Unknown Model>';
    const message = `Strong ${type} relation for ${model}#${name} could not be guaranteed: ${reason}`;
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.code = 'STRONG_RELATION_MANDATE_NOT_GUARANTEED';
    this.relationName = name;
    this.relationType = type;
    this.sourceModelName = model;

    Object.assign(this, extraProperties);
  }
}

/**
 * @experimental
 */
export function isStrongRelationMandateNotGuaranteedError(
  e: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): e is StrongRelationMandateNotGuaranteedError<any> {
  return e instanceof StrongRelationMandateNotGuaranteedError;
}
