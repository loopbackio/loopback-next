---
lang: en
title: 'hasManyThrough Relation'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Model Relation
sidebar: lb4_sidebar
permalink: /doc/en/lb4/HasManyThrough-relation.html
---

## Overview

LoopBack supports _polymorphic relations_ in which a model can belong to more
than one other model, on a single association.

The examples below use the following example models: `Delivery`, `Letter`,
`Parcel`, where a `Delivery` may contain a `Deliverable` - either a `Letter` or
a `Parcel`.

## Model definition

We first define `Deliverable`s:

```javascript
class Deliverable extends Entity {
}

class Letter extends Deliverable {
}

class Parcel extends Deliverable {
}
...
```

The relation between the `Delivery` and `Deliverable`s is: `Delivery` `hasOne`
`Deliverable`; the relation is polymorphic.

```javascript
class Delivery extends Entity {
@hasOne(() => Deliverable, {polymorphic: true})
  deliverable: Deliverable;

deliverableType: string;
}
...
```

A customized discriminator can be specified. The discriminator parameter
specifies the name of a field in the model indicating the actual type of the
`Deliverable`.

```javascript
class Delivery extends Entity {
@hasOne(() => Deliverable, {polymorphic: {discriminator: "deliverable_type"}})
  deliverable: Deliverable;

deliverable_type: string;
}
...
```

## Setting up repository

The only difference on the repository class is that instead of having a single
repository getter, a dictionary of subclass repository getters is passed into
the repository factory creater.

```javascript
export class DeliveryRepository extends DefaultCrudRepository {
  public readonly deliverable: HasOneRepositoryFactory<Deliverable, typeof Delivery.prototype.id>;

  constructor(
    dataSource: juggler.DataSource,
    @repository.getter('LetterRepository')
    protected letterRepositoryGetter: Getter<EntityCrudRepository<Deliverable, typeof Deliverable.prototype.id, DeliverableRelations>>,
    @repository.getter('ParcelRepository')
    protected parcelRepositoryGetter: Getter<EntityCrudRepository<Deliverable, typeof Deliverable.prototype.id, DeliverableRelations>>,
  ) {
    super(Delivery, dataSource);
    this.deliverable = this.createHasOneRepositoryFactoryFor(
      'deliverable',
      // use a dictionary of repoGetters instead of a single repoGetter instance
      {Letter: letterRepositoryGetter, Parcel: parcelRepositoryGetter},
    );
    this.registerInclusionResolver('deliverable', this.deliverable.inclusionResolver);
  }
}
...
```

## Operations

The polymorphic relation supports queries with inclusions

```javascript
const result = await deliveryRepo.findById(delivery1.id, {
  include: ['deliverable'],
});
...
```

The instances of polymorphic relations can be created through repository
operations

```javascript
deliveryRepo
.deliverable(deliveryId)
.create(letter1Data, {polymorphicType: "Letter"});
...
```

## belongsTo, hasMany, hasManyThrough relations

Polymorphic relation on `belongsTo` is similar to `hasOne`.

Polymorphic relation is not supported on `hasMany` relations. However, there is
an easy workaround: having a `hasMany` relation on a non-polymorphic concrete
type which `hasOne` polymorphic relation with an abstract polymorphic type. For
example, `Delivery` `hasMany` `DeliveryDeliverablePair` and
`DeliveryDeliverablePair` `hasOne` `Deliverable`.

The polymorphic relation on `hasManyThrough` relation is on the target model,
not the through model. The discriminator is defined on the through model, and
the target model is polymorphic.
