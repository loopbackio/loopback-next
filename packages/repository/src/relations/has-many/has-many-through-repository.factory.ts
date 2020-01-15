import {Entity, EntityCrudRepository, Getter, HasManyThroughDefinition} from "../..";
import {DefaultHasManyThroughRepository, HasManyThroughRepository} from "./has-many-through.repository";

export type HasManyThroughRepositoryFactory<
  TargetEntity extends Entity,
  TargetID,
  ThroughEntity extends Entity,
  ThroughID,
> = (fkValue: ThroughID) => HasManyThroughRepository<TargetEntity, TargetID, ThroughEntity>;

export function createHasManyThroughRepositoryFactory<
  TargetEntity extends Entity,
  TargetID,
  ThroughEntity extends Entity,
  ThroughID,
>(
  relationMetadata: HasManyThroughDefinition,
  targetRepositoryGetter: Getter<EntityCrudRepository<TargetEntity, TargetID>>,
  throughRepositoryGetter: Getter<EntityCrudRepository<ThroughEntity, ThroughID>>,
): HasManyThroughRepositoryFactory<TargetEntity, TargetID, ThroughEntity, ThroughID> {
  return (fkValue?: ThroughID) => {
    return new DefaultHasManyThroughRepository<
      TargetEntity,
      TargetID,
      EntityCrudRepository<TargetEntity, TargetID>,
      ThroughEntity,
      ThroughID,
      EntityCrudRepository<ThroughEntity, ThroughID>
    >(
      targetRepositoryGetter,
      throughRepositoryGetter,
    );
  }
}
