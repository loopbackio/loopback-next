import {
  DataObject,
  Entity,
  EntityCrudRepository,
  Filter,
  Options,
  Getter,
  constrainFilter,
  constrainDataObject,
  Count,
  Where,
  constrainWhere,
  constrainWhereOr,
} from '../..';

export interface HasAndBelongsToManyRepository<
  Target extends Entity,
  TargetID
> {
  create(
    entity: DataObject<Target>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Target>;

  find(
    filter?: Filter<Target>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Target[]>;

  patch(
    entity: DataObject<Target>,
    where?: Where<Target>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Count>;

  delete(
    where?: Where<Target>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Count>;

  link(targetModelId: TargetID, options?: Options): Promise<void>;

  unlink(targetModelId: TargetID, options?: Options): Promise<void>;
}

export class DefaultHasAndBelongsToManyRepository<
  ThroughRepository extends EntityCrudRepository<ThroughEntity, ThroughID>,
  ThroughEntity extends Entity,
  ThroughID,
  TargetRepository extends EntityCrudRepository<TargetEntity, TargetID>,
  TargetEntity extends Entity,
  TargetID
> implements HasAndBelongsToManyRepository<TargetEntity, TargetID> {
  constructor(
    public getThroughRepository: Getter<ThroughRepository>,
    public getTargetRepository: Getter<TargetRepository>,
    public getThroughConstraintFromSource: () => DataObject<ThroughEntity>,
    public getThroughConstraintFromTarget: (
      targetID: TargetID[],
    ) => DataObject<ThroughEntity>,
    public getTargetConstraintFromThroughModels: (
      throughInstances: ThroughEntity[],
    ) => DataObject<TargetEntity>,
    public getTargetKeys: (throughInstances: ThroughEntity[]) => TargetID[],
    public getTargetIds: (targetInstances: TargetEntity[]) => TargetID[],
  ) {}

  async create(
    entity: DataObject<TargetEntity>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<TargetEntity> {
    const targetRepository = await this.getTargetRepository();
    const targetInstance = await targetRepository.create(entity, options);
    await this.link(targetInstance.getId(), options?.throughOptions);
    return targetInstance;
  }

  async find(
    filter?: Filter<TargetEntity>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<TargetEntity[]> {
    const throughRepository = await this.getThroughRepository();
    const targetRepository = await this.getTargetRepository();
    const sourceConstraint = this.getThroughConstraintFromSource();
    const throughInstances = await throughRepository.find(
      constrainFilter(undefined, sourceConstraint),
      options?.throughOptions,
    );
    const targetConstraint = this.getTargetConstraintFromThroughModels(
      throughInstances,
    );
    return targetRepository.find(
      constrainFilter(filter, targetConstraint),
      options,
    );
  }

  async patch(
    entity: DataObject<TargetEntity>,
    where?: Where<TargetEntity>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Count> {
    const throughRepository = await this.getThroughRepository();
    const targetRepository = await this.getTargetRepository();
    const sourceConstraint = this.getThroughConstraintFromSource();
    const throughInstances = await throughRepository.find(
      constrainFilter(undefined, sourceConstraint),
      options?.throughOptions,
    );
    const targetConstraint = this.getTargetConstraintFromThroughModels(
      throughInstances,
    );
    return targetRepository.updateAll(
      constrainDataObject(entity, targetConstraint),
      constrainWhere(where, targetConstraint as Where<TargetEntity>),
      options,
    );
  }

  async delete(
    where?: Where<TargetEntity>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Count> {
    const throughRepository = await this.getThroughRepository();
    const targetRepository = await this.getTargetRepository();
    const sourceConstraint = this.getThroughConstraintFromSource();
    const throughInstances = await throughRepository.find(
      constrainFilter(undefined, sourceConstraint),
      options?.throughOptions,
    );

    if (where) {
      // Only delete related through models
      // ToDo(Agnes): this performance can be improved by only fetching related data
      // ToDo(Agnes): add target ids to the `where` constraint
      const targets = await targetRepository.find({where});
      const targetIds = this.getTargetIds(targets);
      if (targetIds.length > 0) {
        const targetConstraint = this.getThroughConstraintFromTarget(targetIds);
        const constraints = {...sourceConstraint, ...targetConstraint};
        await throughRepository.deleteAll(
          constrainDataObject({}, constraints as DataObject<ThroughEntity>),
          options?.throughOptions,
        );
      }
    } else {
      // Otherwise, delete through models that relate to the sourceId
      const targetFkValues = this.getTargetKeys(throughInstances);
      // Delete through instances that have the targets that are going to be deleted
      const throughFkConstraint = this.getThroughConstraintFromTarget(
        targetFkValues,
      );
      await throughRepository.deleteAll(
        constrainWhereOr({}, [sourceConstraint, throughFkConstraint]),
      );
    }

    // Delete target(s)
    const targetConstraint = this.getTargetConstraintFromThroughModels(
      throughInstances,
    );
    return targetRepository.deleteAll(
      constrainWhere(where, targetConstraint as Where<TargetEntity>),
      options,
    );
  }

  async link(targetId: TargetID, options?: Options): Promise<void> {
    const throughRepository = await this.getThroughRepository();
    const sourceConstraint = this.getThroughConstraintFromSource();
    const targetConstraint = this.getThroughConstraintFromTarget([targetId]);
    const constraints = {...sourceConstraint, ...targetConstraint};
    await throughRepository.create(
      constrainDataObject({}, constraints as DataObject<ThroughEntity>),
      options,
    );
  }

  async unlink(targetId: TargetID, options?: Options): Promise<void> {
    const throughRepository = await this.getThroughRepository();
    const sourceConstraint = this.getThroughConstraintFromSource();
    const targetConstraint = this.getThroughConstraintFromTarget([targetId]);
    const constraints = {...sourceConstraint, ...targetConstraint};
    await throughRepository.deleteAll(
      constrainDataObject({}, constraints as DataObject<ThroughEntity>),
      options,
    );
  }
}
