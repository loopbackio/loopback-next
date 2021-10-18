# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.7.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.7.2...@loopback/repository@3.7.3) (2021-10-18)


### Bug Fixes

* make sure scope filters are used for each fk on includes ([5d1a8c7](https://github.com/loopbackio/loopback-next/commit/5d1a8c71d6b79d43bd9b6530f7149fcb1756a71f)), closes [#6832](https://github.com/loopbackio/loopback-next/issues/6832)





## [3.7.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.7.1...@loopback/repository@3.7.2) (2021-09-16)

**Note:** Version bump only for package @loopback/repository





## [3.7.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.7.0...@loopback/repository@3.7.1) (2021-07-15)

**Note:** Version bump only for package @loopback/repository





# [3.7.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.6.0...@loopback/repository@3.7.0) (2021-06-10)


### Bug Fixes

* imports core and context in repository mixin ([b9c5a54](https://github.com/loopbackio/loopback-next/commit/b9c5a549756b62b86f0d2b4a4d1f9a0dd0fa8be4))


### Features

* **repository:** change the relation has-many-through support unlinkAll target instance from source ([6968988](https://github.com/loopbackio/loopback-next/commit/6968988516e76024e220185bc1fb41c9f032207e))
* adds support for allowMigration false on repository mixin ([65719e9](https://github.com/loopbackio/loopback-next/commit/65719e96f9289d956bf69001d4f1b6ca3cd27cb3))





# [3.6.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.5.1...@loopback/repository@3.6.0) (2021-05-03)


### Features

* support node v16 ([ac99415](https://github.com/loopbackio/loopback-next/commit/ac994154543bde22b4482ba98813351656db1b55))





## [3.5.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.5.0...@loopback/repository@3.5.1) (2021-04-06)

**Note:** Version bump only for package @loopback/repository





# [3.5.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.4.1...@loopback/repository@3.5.0) (2021-03-18)


### Bug Fixes

* fix compilation errors with TypeScript 4.2.x ([b3c33d5](https://github.com/loopbackio/loopback-next/commit/b3c33d57dc6d9703e0b25fb49fce916c5abc616a))


### Features

* mark Entity and Model to be regular classes ([dc2984e](https://github.com/loopbackio/loopback-next/commit/dc2984eb8e02870e49125bac0109c09c87f60cb0))
* update package-lock.json to v2 consistently ([dfc3fbd](https://github.com/loopbackio/loopback-next/commit/dfc3fbdae0c9ca9f34c64154a471bef22d5ac6b7))





## [3.4.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.4.0...@loopback/repository@3.4.1) (2021-02-09)

**Note:** Version bump only for package @loopback/repository





# [3.4.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.3.0...@loopback/repository@3.4.0) (2021-01-21)


### Bug Fixes

* **repository:** unwanted object param manipulation ([8171744](https://github.com/loopbackio/loopback-next/commit/8171744f473ab5a05e8f0758630a73c00ea8e7cf)), closes [#5814](https://github.com/loopbackio/loopback-next/issues/5814)


### Features

* add connector interface enums ([763bf72](https://github.com/loopbackio/loopback-next/commit/763bf720ae1031f8eba2f4a24f9a3bbc855d7781))
* normalize debug scopes in relations ([b3c52c1](https://github.com/loopbackio/loopback-next/commit/b3c52c191fc98cc6fc2b304c838d5b15b62ddcb5))





# [3.3.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.2.1...@loopback/repository@3.3.0) (2020-12-07)


### Features

* leverage simpler syntax for inclusion ([3bcc61c](https://github.com/loopbackio/loopback-next/commit/3bcc61c420672b81e4639e0e0fc7e92035e41219))
* **filter:** introduce simpler syntax for inclusion ([2fe32ac](https://github.com/loopbackio/loopback-next/commit/2fe32ac0f9c820ff1df242ea6e32c972a4dee383))





## [3.2.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.2.0...@loopback/repository@3.2.1) (2020-11-18)


### Bug Fixes

* **repository:** fix invalid inclusion relation name error code ([4a73bd1](https://github.com/loopbackio/loopback-next/commit/4a73bd140f68e2d767410dd9ed74c8b8be1d141e))





# [3.2.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.1.0...@loopback/repository@3.2.0) (2020-11-05)


### Bug Fixes

* this.definition.idName is not a function ([4ae5069](https://github.com/loopbackio/loopback-next/commit/4ae5069f556073f764a622ffc704a337af3858b8))


### Features

* **repository:** provide a shortcut to hiddenProperties in property decorator ([3160424](https://github.com/loopbackio/loopback-next/commit/3160424e5231a2ea71613749162203c5b1418795))





# [3.1.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.0.1...@loopback/repository@3.1.0) (2020-10-07)


### Bug Fixes

* tidy up type inferences for OpenAPI SchemaObject ([013bb7e](https://github.com/loopbackio/loopback-next/commit/013bb7e4c0f7499a7f77c152dea7caa14e19b7cc))


### Features

* **repository:** implement hasManyThrough resolver ([8e7767d](https://github.com/loopbackio/loopback-next/commit/8e7767df0a4679c8c70ad524e56aea9783def521))





## [3.0.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@3.0.0...@loopback/repository@3.0.1) (2020-09-17)

**Note:** Version bump only for package @loopback/repository





# [3.0.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.11.2...@loopback/repository@3.0.0) (2020-09-15)


### Bug Fixes

* improve handling of missing design-time type metadata ([95b6a2b](https://github.com/loopbackio/loopback-next/commit/95b6a2b7ce64e614720df43b905f77a53a54e438))


### Features

* **repository:** add types to the configuration for autocompletion ([6fbf23d](https://github.com/loopbackio/loopback-next/commit/6fbf23d3e6366a99ee0ff543fd05fe15bdb711ca))
* move framework packages to `devDependencies` ([e2c61ce](https://github.com/loopbackio/loopback-next/commit/e2c61ce79aa68d76f6e7138642034160b50063f0))
* refactor filters into standalone package ([f52d4df](https://github.com/loopbackio/loopback-next/commit/f52d4dffb1873446e3eec4d6c0f50bbeb528c922)), closes [#5957](https://github.com/loopbackio/loopback-next/issues/5957)


### BREAKING CHANGES

* components no longer install core framework packages as
their own dependencies, they use the framework packages provided by the
target application instead.

If you are getting `npm install` errors after upgrade, then make sure
your project lists all dependencies required by the extensions you are
using.

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>





## [2.11.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.11.1...@loopback/repository@2.11.2) (2020-08-27)


### Bug Fixes

* **repository:** fix test case for repository.execute ([ff0c969](https://github.com/loopbackio/loopback-next/commit/ff0c969b441030cc21c0d2e6413ab6b1943f2281))





## [2.11.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.11.0...@loopback/repository@2.11.1) (2020-08-19)


### Bug Fixes

* **docs:** rename legacy juggler to juggler ([d1febb1](https://github.com/loopbackio/loopback-next/commit/d1febb17341ef647e203cb24cba3b716c0163f4c))
* **repository:** apply `[@model](https://github.com/model)` to generated model class ([9a1b1e4](https://github.com/loopbackio/loopback-next/commit/9a1b1e4324516bc1351e08943b8b0c5a00e75992))
* **repository:** remove experimental note ([921e6ae](https://github.com/loopbackio/loopback-next/commit/921e6aee81130e92948c24e844424183e4147ab3))





# [2.11.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.10.0...@loopback/repository@2.11.0) (2020-08-05)


### Bug Fixes

* **repository:** convert relation property in toobject ([85a6164](https://github.com/loopbackio/loopback-next/commit/85a616415253bdca0475b7db9072da1ee611ac28))


### Features

* **repository:** add support for non-SQL variants of `Repository.execute()` ([49b86c4](https://github.com/loopbackio/loopback-next/commit/49b86c463648ef5e0cfac4e9db14334291e992ab))





# [2.10.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.9.0...@loopback/repository@2.10.0) (2020-07-20)


### Bug Fixes

* **repository:** hasManyThrough can delete correct target n through based on filter ([c1ba91f](https://github.com/loopbackio/loopback-next/commit/c1ba91f2dcbc33dd1cee905d25f9719a71bc7919))
* ensure delete only applies to optional properties ([89cd43f](https://github.com/loopbackio/loopback-next/commit/89cd43f1a455983f120d9bb9c869eac36adc7ad7))


### Features

* **repository:** add helpers to create relations ([42d17aa](https://github.com/loopbackio/loopback-next/commit/42d17aa37fa88bb4c4152b26450ddb8b72da1f49))





# [2.9.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.8.0...@loopback/repository@2.9.0) (2020-06-30)


### Features

* add HasManyThroughFactory to Juggler bridge ([c2d4352](https://github.com/loopbackio/loopback-next/commit/c2d43524be4fd1345970b29e722e57890f2ea766))
* **repository:** add link and unlink methods ([31dc4e9](https://github.com/loopbackio/loopback-next/commit/31dc4e989ae981732fa43f7f48dfb8f19d5ac796))





# [2.8.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.7.0...@loopback/repository@2.8.0) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/loopbackio/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))


### Features

* **repository:** implement hasManyThrough repo ([ecd2780](https://github.com/loopbackio/loopback-next/commit/ecd2780c034e902e72905f0bbefe3a6fe08c3a2c))





# [2.7.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.6.0...@loopback/repository@2.7.0) (2020-06-11)


### Bug Fixes

* **repository:** fix DynamicModelCtor type to correctly preserve Props ([927789e](https://github.com/loopbackio/loopback-next/commit/927789e254f4db7945201609683ae83a18f1c48d))


### Features

* **repository:** add hasManyThrough factory and tests ([3304963](https://github.com/loopbackio/loopback-next/commit/33049634e2320cd30e5f9403e03db17000dd49cd))
* **repository:** add more helpers for HasManyThrough ([c795544](https://github.com/loopbackio/loopback-next/commit/c7955446c38b2dfd0d064eb6fa4d90a7f76283a2))
* **repository:** adds fuzzy where filters to WhereBuilder ([7f79805](https://github.com/loopbackio/loopback-next/commit/7f798052b33077b12ae2becb5c42453800aa54aa)), closes [#5577](https://github.com/loopbackio/loopback-next/issues/5577)





# [2.6.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.5.1...@loopback/repository@2.6.0) (2020-05-28)


### Features

* **repository:** allow components to contribute models for DI ([e74fc57](https://github.com/loopbackio/loopback-next/commit/e74fc5725a52227a4cf37ae7d2796df0f5288142))





## [2.5.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.5.0...@loopback/repository@2.5.1) (2020-05-20)

**Note:** Version bump only for package @loopback/repository





# [2.5.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.4.0...@loopback/repository@2.5.0) (2020-05-19)


### Bug Fixes

* hidden properties when strict is false ([133cc6b](https://github.com/loopbackio/loopback-next/commit/133cc6b267cd3e339821eb908c87e571773dc845))


### Features

* **repository:** add `model()` to RepositoryMixin ([8314612](https://github.com/loopbackio/loopback-next/commit/8314612f816f0eb41d5a30f71dffa8738b84b2d6)), closes [/github.com/loopbackio/loopback-next/pull/5378#discussion_r424980840](https://github.com//github.com/loopbackio/loopback-next/pull/5378/issues/discussion_r424980840)
* **repository:** adding hasManyThrough to hasMany and its helpers ([fe4cf5e](https://github.com/loopbackio/loopback-next/commit/fe4cf5e523bb86dd8b9160c0382e1aba2d096056))
* **repository:** define constants for repository binding namespaces and tags ([43e84a1](https://github.com/loopbackio/loopback-next/commit/43e84a1ad53bc849f15dfbc5fc11123108463be4))
* **repository:** extract helper `rejectNavigationalPropertiesInData` ([4cc8eba](https://github.com/loopbackio/loopback-next/commit/4cc8eba853232213f9f82408568587d81103142e))





# [2.4.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.3.0...@loopback/repository@2.4.0) (2020-05-07)


### Bug Fixes

* **repository:** updateById behaves like updateAll when called with an undefined value for id ([763dba0](https://github.com/loopbackio/loopback-next/commit/763dba0abba568af5397f70f0928842bfbe92f3d))


### Features

* **core:** allow options for artifact registration on an application ([f3fdc3b](https://github.com/loopbackio/loopback-next/commit/f3fdc3b94e34610dd1bebb600a497c77a2794019))
* **repository:** add null type ([0aa585a](https://github.com/loopbackio/loopback-next/commit/0aa585a5ea686b9c9a06b5341a1dcdfa4c80787c))
* **repository:** generic factory for repository classes ([501f032](https://github.com/loopbackio/loopback-next/commit/501f032f5dfcedf24f8c08a150a9efde657802d7))
* **repository:** to object preserves prototype ([52465c3](https://github.com/loopbackio/loopback-next/commit/52465c35b774f7f04ee191333fc4d9b1126be23f))





# [2.3.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.2.1...@loopback/repository@2.3.0) (2020-04-29)


### Features

* populate x-typescript-type for openapi schema ([02a2633](https://github.com/loopbackio/loopback-next/commit/02a26339e8a49b92148aa9c05179458a4bc85a70))





## [2.2.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.2.0...@loopback/repository@2.2.1) (2020-04-23)

**Note:** Version bump only for package @loopback/repository





# [2.2.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.1.1...@loopback/repository@2.2.0) (2020-04-22)


### Features

* **repository:** use JsonSchema to constrain property/model definitions ([5de2ae2](https://github.com/loopbackio/loopback-next/commit/5de2ae2730d4cc08f86b9458947afbd2d71976c1))
* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/loopbackio/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))





## [2.1.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.1.0...@loopback/repository@2.1.1) (2020-04-11)

**Note:** Version bump only for package @loopback/repository





# [2.1.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.0.2...@loopback/repository@2.1.0) (2020-04-08)


### Bug Fixes

* remove restriction to Entities from DefaultKeyValueRepository ([c30dce3](https://github.com/loopbackio/loopback-next/commit/c30dce330fd6585ce8b0d33d3d6a5d2fd5fac906))


### Features

* remove Node.js 8.x polyfill for Symbol.asyncIterator ([eeb8772](https://github.com/loopbackio/loopback-next/commit/eeb877276cf62d32856eb7227d78618ab4c93c2e))





## [2.0.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.0.1...@loopback/repository@2.0.2) (2020-03-24)


### Bug Fixes

* **repository-json-schema:** fix schema generation for model inheritance ([5417ed5](https://github.com/loopbackio/loopback-next/commit/5417ed5fdbf0508f1882186d9cbff64ecfb10699))
* update package locks ([cd2f6fa](https://github.com/loopbackio/loopback-next/commit/cd2f6fa7a732afe4a16f4ccf8316ff3142959fe8))





## [2.0.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@2.0.0...@loopback/repository@2.0.1) (2020-03-17)


### Bug Fixes

* filter null keys when including belongs-to relations in queries ([cccb37f](https://github.com/loopbackio/loopback-next/commit/cccb37f43f3ccaf950c23759315b4dde41da4e8b))





# [2.0.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.19.1...@loopback/repository@2.0.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/loopbackio/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* constrain filter to exclude where for findById ([360d563](https://github.com/loopbackio/loopback-next/commit/360d563361358dead0ac18198b2878aedb5f48c7))
* support operation hooks ([8701cce](https://github.com/loopbackio/loopback-next/commit/8701cce8b208c952e4d41f0570124e389506d808))
* **repository:** make `targetsMany` property required ([cd4d43a](https://github.com/loopbackio/loopback-next/commit/cd4d43abb0ebe56aa31939c14ae9d25021ad1e65))
* **repository:** remove generic parameters from `Inclusion` type ([ed949e4](https://github.com/loopbackio/loopback-next/commit/ed949e415ff0be1467b3029fb2e49c64a22c1b2e))
* **repository:** skip undefined property values for toJSON ([70fc005](https://github.com/loopbackio/loopback-next/commit/70fc005823ab4e5cf4b641d2d80668911a26012a))
* add `tslib` as dependency ([a6e0b4c](https://github.com/loopbackio/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/loopbackio/loopback-next/issues/4676)
* preserve custom type of auto-generated id property ([dc7ff7f](https://github.com/loopbackio/loopback-next/commit/dc7ff7f7829434de3436e9352b1d9cc43392db0e))


### BREAKING CHANGES

* **repository:** If you are building a custom relation type with its
own definition interface, make sure the interface includes `targetsMany`
property. Typically, the type of this property is hard-coded as `true`
or `false`, depending on the relation type.

```ts
interface HasManyDefinition extends RelationDefinitionBase {
  type: RelationType.hasMany;
  targetsMany: true;
  // etc.
}

export interface BelongsToDefinition extends RelationDefinitionBase {
  type: RelationType.belongsTo;
  targetsMany: false;
  // etc.
}
```

When creating an instance of a relation definition, make sure to include
a value for `targetsMany` property.

```ts
new ModelDefinition('Order')
  .addRelation({
    name: 'customer',
    type: RelationType.belongsTo,
    targetsMany: false,
    source: Order,
    target: () => Customer,
    keyFrom: 'customerId',
    keyTo: 'id',
  });
```

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>
* **repository:** The type `Inclusion` is no longer generic. Please
update your code and remove any generic arguments provided for the type.

```diff
- Inclusion<MyModel>
+ Inclusion
```

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>
* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [1.19.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.19.0...@loopback/repository@1.19.1) (2020-02-06)

**Note:** Version bump only for package @loopback/repository





# [1.19.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.18.0...@loopback/repository@1.19.0) (2020-02-05)


### Features

* leverage isactive for transaction ([fc94437](https://github.com/loopbackio/loopback-next/commit/fc9443787039d4a1db3008a0141f5693f95bfbd4))





# [1.18.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.17.0...@loopback/repository@1.18.0) (2020-01-27)


### Bug Fixes

* **repository:** make the navigational property err msg more clear ([2d493bc](https://github.com/loopbackio/loopback-next/commit/2d493bc0387b9f595b82ee149fb83405f4073424))


### Features

* **repository:** add interface for hasManyThrough repository ([a242785](https://github.com/loopbackio/loopback-next/commit/a24278522c46337887592e864031de891d08f30d)), closes [/github.com/loopbackio/loopback-next/pull/2359#issuecomment-559719080](https://github.com//github.com/loopbackio/loopback-next/pull/2359/issues/issuecomment-559719080)





# [1.17.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.16.0...@loopback/repository@1.17.0) (2020-01-07)


### Bug Fixes

* **repository:** belongsto accessor should return undefined if foreign key is not included ([cbdba15](https://github.com/loopbackio/loopback-next/commit/cbdba1554fe103109a21e20c48cd3a0edcf8fffb))


### Features

* **repository:** add interface for hasManyThrough ([ced2643](https://github.com/loopbackio/loopback-next/commit/ced26437c6fa8bd34fa897325730610ec017bc16))
* **repository:** allow custom keyFrom for hasmany/hasone ([58efff9](https://github.com/loopbackio/loopback-next/commit/58efff9e166fbe1fc820fe6168e18b5c7d9630ce))





# [1.16.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.15.5...@loopback/repository@1.16.0) (2019-12-09)


### Bug Fixes

* **repository:** fix DeepPartial<AnyObject> ([0f97811](https://github.com/loopbackio/loopback-next/commit/0f97811256304ab048a93858f7a86229bc662e7a))


### Features

* **repository:** add `defineModelClass` helper ([4d844d1](https://github.com/loopbackio/loopback-next/commit/4d844d1a6812ebbe18e30d646e7bc854974a1f76))
* **repository:** add title property to Count schema definition ([a91c989](https://github.com/loopbackio/loopback-next/commit/a91c9897f48365b9c888fd08075c82de44774331))
* **repository:** enable inclusion with custom scope ([4a0d595](https://github.com/loopbackio/loopback-next/commit/4a0d595f65a2c80c89e2ca1263d235e4d23cd730))
* **repository:** rejects create/update operations for navigational properties ([01de327](https://github.com/loopbackio/loopback-next/commit/01de3275be7c6dd8e9c50ffeb64c23d6d7ec9e51))





## [1.15.5](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.15.4...@loopback/repository@1.15.5) (2019-11-25)

**Note:** Version bump only for package @loopback/repository





## [1.15.4](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.15.3...@loopback/repository@1.15.4) (2019-11-12)


### Bug Fixes

* **repository:** fix compilation errors with TypeScript 3.7.2 ([d62612d](https://github.com/loopbackio/loopback-next/commit/d62612d08e34f4d32b5a3d1645aa0420fecea3b3))
* **repository:** improve stub typing to avoid compilation errors with TypeScript 3.7 ([29cf103](https://github.com/loopbackio/loopback-next/commit/29cf103c780312cf15bf8e1dd189394ae7540fe4))
* **repository:** improve typings for model inclusion ([eb1a0ae](https://github.com/loopbackio/loopback-next/commit/eb1a0ae7a433e566f413a7e3c518b3aeff5374c4))





## [1.15.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.15.2...@loopback/repository@1.15.3) (2019-10-24)

**Note:** Version bump only for package @loopback/repository





## [1.15.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.15.1...@loopback/repository@1.15.2) (2019-10-07)

**Note:** Version bump only for package @loopback/repository





## [1.15.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.15.0...@loopback/repository@1.15.1) (2019-09-28)

**Note:** Version bump only for package @loopback/repository





# [1.15.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.14.0...@loopback/repository@1.15.0) (2019-09-27)


### Bug Fixes

* **repository:** allow model classes with recursive type references ([0094ded](https://github.com/loopbackio/loopback-next/commit/0094ded)), closes [/github.com/loopbackio/loopback-next/issues/3671#issuecomment-529376105](https://github.com//github.com/loopbackio/loopback-next/issues/3671/issues/issuecomment-529376105)


### Features

* **repository:** implement inclusion resolver for belongsTo relation ([fc3d5b6](https://github.com/loopbackio/loopback-next/commit/fc3d5b6))
* **repository:** implement inclusion resolver for hasOne relation ([8dfdf58](https://github.com/loopbackio/loopback-next/commit/8dfdf58))
* **repository:** implement inclusionResolver for hasMany ([4cf9a70](https://github.com/loopbackio/loopback-next/commit/4cf9a70))





# [1.14.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.13.1...@loopback/repository@1.14.0) (2019-09-17)


### Features

* **repository:** add keyFrom to resolved relation metadata ([fb4c5c8](https://github.com/loopbackio/loopback-next/commit/fb4c5c8))





## [1.13.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.13.0...@loopback/repository@1.13.1) (2019-09-06)

**Note:** Version bump only for package @loopback/repository





# [1.13.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.12.0...@loopback/repository@1.13.0) (2019-09-03)


### Features

* **repository:** add inclusionResolvers to DefaultCrudRepository ([642c4b6](https://github.com/loopbackio/loopback-next/commit/642c4b6))





# [1.12.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.11.1...@loopback/repository@1.12.0) (2019-08-19)


### Features

* **repository:** add InclusionResolver type and includeRelatedModels helper function ([c9c39c9](https://github.com/loopbackio/loopback-next/commit/c9c39c9))





## [1.11.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.11.0...@loopback/repository@1.11.1) (2019-08-15)

**Note:** Version bump only for package @loopback/repository





# [1.11.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.10.1...@loopback/repository@1.11.0) (2019-08-15)


### Bug Fixes

* fixup findByForeignKeys ([e26e7b7](https://github.com/loopbackio/loopback-next/commit/e26e7b7))


### Features

* **repository:** add function findByForeignKeys ([f5eaf1d](https://github.com/loopbackio/loopback-next/commit/f5eaf1d))
* **repository:** expose beginTransaction() API ([0471315](https://github.com/loopbackio/loopback-next/commit/0471315))





## [1.10.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.10.0...@loopback/repository@1.10.1) (2019-07-31)

**Note:** Version bump only for package @loopback/repository





# [1.10.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.9.0...@loopback/repository@1.10.0) (2019-07-26)


### Features

* **repository:** add hidden properties in model ([e669913](https://github.com/loopbackio/loopback-next/commit/e669913))





# [1.9.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.8.2...@loopback/repository@1.9.0) (2019-07-17)


### Bug Fixes

* **repository:** make sure foreign key property in keyTo exists in target model ([ce75385](https://github.com/loopbackio/loopback-next/commit/ce75385))


### Features

* **repository:** add static method Entity.getIdProperties() ([be4bf31](https://github.com/loopbackio/loopback-next/commit/be4bf31))





## [1.8.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.8.1...@loopback/repository@1.8.2) (2019-06-28)

**Note:** Version bump only for package @loopback/repository





## [1.8.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.8.0...@loopback/repository@1.8.1) (2019-06-21)

**Note:** Version bump only for package @loopback/repository





# [1.8.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.7.0...@loopback/repository@1.8.0) (2019-06-20)


### Features

* **repository:** include navigation properties in JSON ([008c8b5](https://github.com/loopbackio/loopback-next/commit/008c8b5))





# [1.7.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.6.1...@loopback/repository@1.7.0) (2019-06-17)


### Features

* **repository-json-schema:** enhance getJsonSchema to describe navigational properties ([7801f59](https://github.com/loopbackio/loopback-next/commit/7801f59)), closes [#2630](https://github.com/loopbackio/loopback-next/issues/2630)





## [1.6.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.6.0...@loopback/repository@1.6.1) (2019-06-06)

**Note:** Version bump only for package @loopback/repository





# [1.6.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.5.8...@loopback/repository@1.6.0) (2019-06-03)


### Features

* add navigational properties to find* methods ([1f0aa0b](https://github.com/loopbackio/loopback-next/commit/1f0aa0b))
* replace tslint with eslint ([44185a7](https://github.com/loopbackio/loopback-next/commit/44185a7))





## [1.5.8](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.5.7...@loopback/repository@1.5.8) (2019-05-31)

**Note:** Version bump only for package @loopback/repository





## [1.5.7](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.5.6...@loopback/repository@1.5.7) (2019-05-30)

**Note:** Version bump only for package @loopback/repository





## [1.5.6](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.5.5...@loopback/repository@1.5.6) (2019-05-23)


### Bug Fixes

* **repository:** always copy property definition during juggler model build ([#2912](https://github.com/loopbackio/loopback-next/issues/2912)) ([f6cae52](https://github.com/loopbackio/loopback-next/commit/f6cae52))





## [1.5.5](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.5.4...@loopback/repository@1.5.5) (2019-05-14)

**Note:** Version bump only for package @loopback/repository





## [1.5.4](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.5.3...@loopback/repository@1.5.4) (2019-05-10)

**Note:** Version bump only for package @loopback/repository





## [1.5.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.5.2...@loopback/repository@1.5.3) (2019-05-09)

**Note:** Version bump only for package @loopback/repository





## [1.5.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.5.1...@loopback/repository@1.5.2) (2019-05-06)

**Note:** Version bump only for package @loopback/repository





## [1.5.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.5.0...@loopback/repository@1.5.1) (2019-04-26)

**Note:** Version bump only for package @loopback/repository





# [1.5.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.4.1...@loopback/repository@1.5.0) (2019-04-20)


### Bug Fixes

* **repository:** relax constrain check to allow input containing constrained values ([c774ed1](https://github.com/loopbackio/loopback-next/commit/c774ed1))


### Features

* **build:** add more TypeScript "strict" checks ([866aa2f](https://github.com/loopbackio/loopback-next/commit/866aa2f))





## [1.4.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.4.0...@loopback/repository@1.4.1) (2019-04-11)

**Note:** Version bump only for package @loopback/repository





# [1.4.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.3.0...@loopback/repository@1.4.0) (2019-04-09)


### Features

* **repository-json-schema:** refactor metaToJsonProperty to accept custom jsonSchema ([d0014c6](https://github.com/loopbackio/loopback-next/commit/d0014c6))





# [1.3.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.2.1...@loopback/repository@1.3.0) (2019-04-05)


### Features

* **repository:** add execute implementation ([3bd6165](https://github.com/loopbackio/loopback-next/commit/3bd6165)), closes [#2165](https://github.com/loopbackio/loopback-next/issues/2165)





## [1.2.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.2.0...@loopback/repository@1.2.1) (2019-03-22)

**Note:** Version bump only for package @loopback/repository





# [1.2.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.1.8...@loopback/repository@1.2.0) (2019-03-22)


### Bug Fixes

* **repository:** support embedded models in nested properties ([d298ec8](https://github.com/loopbackio/loopback-next/commit/d298ec8))


### Features

* **context:** honor binding scope from [@bind](https://github.com/bind) ([3b30f01](https://github.com/loopbackio/loopback-next/commit/3b30f01))
* **repository:** add PATCH and DELETE for HasOne relation ([5936fb9](https://github.com/loopbackio/loopback-next/commit/5936fb9))
* **repository:** allow optional property definition on belongsTo decorator ([11c7baa](https://github.com/loopbackio/loopback-next/commit/11c7baa))





## [1.1.8](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.1.7...@loopback/repository@1.1.8) (2019-03-12)


### Bug Fixes

* model id type is now boolean|number instead of boolean ([71292e9](https://github.com/loopbackio/loopback-next/commit/71292e9))





## [1.1.7](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.1.6...@loopback/repository@1.1.7) (2019-03-01)


### Bug Fixes

* **repository:** change default binding scope to TRANSIENT for repos ([55461af](https://github.com/loopbackio/loopback-next/commit/55461af))





## [1.1.6](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.1.5...@loopback/repository@1.1.6) (2019-02-25)

**Note:** Version bump only for package @loopback/repository





## [1.1.5](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.1.4...@loopback/repository@1.1.5) (2019-02-08)


### Bug Fixes

* update to the most recent lodash version ([65ee865](https://github.com/loopbackio/loopback-next/commit/65ee865))





## [1.1.4](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.1.3...@loopback/repository@1.1.4) (2019-01-28)

**Note:** Version bump only for package @loopback/repository





## [1.1.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.1.2...@loopback/repository@1.1.3) (2019-01-15)


### Bug Fixes

* **repository:** remove property.array() call from hasMany decorator ([56ab017](https://github.com/loopbackio/loopback-next/commit/56ab017)), closes [#1944](https://github.com/loopbackio/loopback-next/issues/1944)





## [1.1.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.1.1...@loopback/repository@1.1.2) (2019-01-14)


### Bug Fixes

* add nin operator to query typing and builder ([#2215](https://github.com/loopbackio/loopback-next/issues/2215)) ([c38bd4e](https://github.com/loopbackio/loopback-next/commit/c38bd4e))
* rework tslint comments disabling "no-unused-variable" rule ([a18a3d7](https://github.com/loopbackio/loopback-next/commit/a18a3d7))





## [1.1.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.1.0...@loopback/repository@1.1.1) (2018-12-20)

**Note:** Version bump only for package @loopback/repository





# [1.1.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.0.6...@loopback/repository@1.1.0) (2018-12-13)


### Bug Fixes

* **repository:** revert hasOne target FK as PK implementation ([fcc76df](https://github.com/loopbackio/loopback-next/commit/fcc76df))


### Features

* **repository:** add belongsToUniquely sugar syntax method ([1b5b66a](https://github.com/loopbackio/loopback-next/commit/1b5b66a))
* **repository:** hasOne relation ([7c2080a](https://github.com/loopbackio/loopback-next/commit/7c2080a))
* **repository:** migrateSchema APIs ([ad0229b](https://github.com/loopbackio/loopback-next/commit/ad0229b))





## [1.0.6](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.0.5...@loopback/repository@1.0.6) (2018-11-26)

**Note:** Version bump only for package @loopback/repository





## [1.0.5](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.0.4...@loopback/repository@1.0.5) (2018-11-17)


### Bug Fixes

* **repository:** make sure model definition is built correctly ([2effa30](https://github.com/loopbackio/loopback-next/commit/2effa30))





## [1.0.4](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.0.3...@loopback/repository@1.0.4) (2018-11-14)

**Note:** Version bump only for package @loopback/repository





<a name="1.0.3"></a>
## [1.0.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.0.1...@loopback/repository@1.0.3) (2018-11-08)


### Bug Fixes

* **repository:** build relations based on their names ([2046701](https://github.com/loopbackio/loopback-next/commit/2046701))


### Performance Improvements

* **repository:** prevent multiple array allocation ([a026d33](https://github.com/loopbackio/loopback-next/commit/a026d33))





<a name="1.0.1"></a>
## [1.0.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@1.0.0...@loopback/repository@1.0.1) (2018-10-17)


### Performance Improvements

* **repository:** prevent multiple array allocation ([691981c](https://github.com/loopbackio/loopback-next/commit/691981c))





<a name="0.21.2"></a>
## [0.21.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.21.1...@loopback/repository@0.21.2) (2018-10-08)

**Note:** Version bump only for package @loopback/repository





<a name="0.21.1"></a>
## [0.21.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.21.0...@loopback/repository@0.21.1) (2018-10-06)


### Bug Fixes

* **repository:** resolve types for juggler ([41e456c](https://github.com/loopbackio/loopback-next/commit/41e456c))





<a name="0.21.0"></a>
# [0.21.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.20.0...@loopback/repository@0.21.0) (2018-10-05)


### Bug Fixes

* mark HasManyRepository as a readonly property ([39227eb](https://github.com/loopbackio/loopback-next/commit/39227eb))


### Features

* **repository:** implement belongsTo relation ([df8c64c](https://github.com/loopbackio/loopback-next/commit/df8c64c))





<a name="0.20.0"></a>
# [0.20.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.19.0...@loopback/repository@0.20.0) (2018-10-03)


### Bug Fixes

* **repository:** use PropertyType instead of Function ([ec9f325](https://github.com/loopbackio/loopback-next/commit/ec9f325))
* clean up dataSource usage ([69506a4](https://github.com/loopbackio/loopback-next/commit/69506a4))


### Features

* **testlab:** add StubbedInstanceWithSinonAccessor ([1dc2304](https://github.com/loopbackio/loopback-next/commit/1dc2304))





<a name="0.19.0"></a>
# [0.19.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.18.1...@loopback/repository@0.19.0) (2018-09-28)


### Features

* **repository:** return an object for count and updateAll ([c146366](https://github.com/loopbackio/loopback-next/commit/c146366))





<a name="0.18.1"></a>
## [0.18.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.18.0...@loopback/repository@0.18.1) (2018-09-27)

**Note:** Version bump only for package @loopback/repository





<a name="0.18.0"></a>
# [0.18.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.17.1...@loopback/repository@0.18.0) (2018-09-25)


### Features

* builders for Filter and Where schemas ([ca8d96e](https://github.com/loopbackio/loopback-next/commit/ca8d96e))
* type resolver for property decorators ([49454aa](https://github.com/loopbackio/loopback-next/commit/49454aa))





<a name="0.17.1"></a>
## [0.17.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.17.0...@loopback/repository@0.17.1) (2018-09-21)

**Note:** Version bump only for package @loopback/repository





<a name="0.17.0"></a>
# [0.17.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.16.5...@loopback/repository@0.17.0) (2018-09-19)


### Features

* **repository:** change Model.modelName to a computed property ([5a493cf](https://github.com/loopbackio/loopback-next/commit/5a493cf))
* **repository:** implement EntityNotFoundError ([d670d10](https://github.com/loopbackio/loopback-next/commit/d670d10))
* **repository:** rework *ById methods to throw if id not found ([264f231](https://github.com/loopbackio/loopback-next/commit/264f231))





<a name="0.16.5"></a>
## [0.16.5](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.16.4...@loopback/repository@0.16.5) (2018-09-14)


### Bug Fixes

* **repository:** convert array items to json ([33124db](https://github.com/loopbackio/loopback-next/commit/33124db))





<a name="0.16.4"></a>
## [0.16.4](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.16.3...@loopback/repository@0.16.4) (2018-09-14)


### Bug Fixes

* **repository:** handle conversion of property values to plain json ([8fcc938](https://github.com/loopbackio/loopback-next/commit/8fcc938))





<a name="0.16.3"></a>
## [0.16.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.16.2...@loopback/repository@0.16.3) (2018-09-14)

**Note:** Version bump only for package @loopback/repository





<a name="0.16.2"></a>
## [0.16.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.16.1...@loopback/repository@0.16.2) (2018-09-12)

**Note:** Version bump only for package @loopback/repository





<a name="0.16.1"></a>
## [0.16.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.16.0...@loopback/repository@0.16.1) (2018-09-10)

**Note:** Version bump only for package @loopback/repository





<a name="0.16.0"></a>
# [0.16.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.15.1...@loopback/repository@0.16.0) (2018-09-08)


### Bug Fixes

* remove extra imports for mixin dependencies ([35b916b](https://github.com/loopbackio/loopback-next/commit/35b916b))


### Features

* default 404 for request to non-existent resource ([f68a45c](https://github.com/loopbackio/loopback-next/commit/f68a45c))
* **service-proxy:** add service mixin ([fb01931](https://github.com/loopbackio/loopback-next/commit/fb01931))





<a name="0.15.1"></a>
## [0.15.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.15.0...@loopback/repository@0.15.1) (2018-08-24)

**Note:** Version bump only for package @loopback/repository





<a name="0.15.0"></a>
# [0.15.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.14.3...@loopback/repository@0.15.0) (2018-08-15)


### Bug Fixes

* **repository:** change the way array property definition is built for the juggler ([2471c88](https://github.com/loopbackio/loopback-next/commit/2471c88))


### Features

* **repository:** add KVRepository impl using legacy juggler ([97a75dc](https://github.com/loopbackio/loopback-next/commit/97a75dc))




<a name="0.14.3"></a>
## [0.14.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.14.2...@loopback/repository@0.14.3) (2018-08-08)




**Note:** Version bump only for package @loopback/repository

<a name="0.14.2"></a>
## [0.14.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.14.1...@loopback/repository@0.14.2) (2018-07-21)




**Note:** Version bump only for package @loopback/repository

<a name="0.14.1"></a>
## [0.14.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.14.0...@loopback/repository@0.14.1) (2018-07-20)




**Note:** Version bump only for package @loopback/repository

<a name="0.14.0"></a>
# [0.14.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.13.3...@loopback/repository@0.14.0) (2018-07-20)


### Bug Fixes

* **repository:** change parameter order in HasManyRepositoryFactory ([534895d](https://github.com/loopbackio/loopback-next/commit/534895d))
* **repository:** default where object to an empty object ([4b14a5c](https://github.com/loopbackio/loopback-next/commit/4b14a5c))


### BREAKING CHANGES

* **repository:** the generic SourceID for type HasManyRepositoryFactory
has been renamed to ForeignKeyType and switched with Target generic.
Also, the function createHasManyRepositoryFactory also renames the same
generic and makes it the last declared generic. Lastly, the generic
ForeignKeyType is added to DefaultCrudRepository#_createHasManyRepository
FactoryFor function. Assuming there is an Order and Customer model defined,
see the following examples for upgrade instructions:

For `HasManyRepository` type:

```diff
- public orders: HasManyRepository<typeof Customer.prototype.id, Order>
+ public orders: HasManyRepository<Order, typeof Customer.prototype.id>
```

For `createHasManyRepositoryFactory` function:

```diff
- const orderFactoryFn = createHasManyRepositoryFactory<typeof Customer.
prototype.id, Order, typeof Order.prototype.id>(...);
+ const orderFactoryFn = createHasManyRepositoryFactory<Order, typeof Order.
prototype.id, typeof Customer.prototype.id>(...);
```




<a name="0.13.3"></a>
## [0.13.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.13.2...@loopback/repository@0.13.3) (2018-07-13)


### Bug Fixes

* **repository:** change RelationType from numeric to string enums ([62090fc](https://github.com/loopbackio/loopback-next/commit/62090fc))




<a name="0.13.2"></a>
## [0.13.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.13.1...@loopback/repository@0.13.2) (2018-07-11)




**Note:** Version bump only for package @loopback/repository

<a name="0.13.1"></a>
## [0.13.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.13.0...@loopback/repository@0.13.1) (2018-07-10)


### Bug Fixes

* **repository:** fix return type of DefaultCrudRepository#_createHasManyRepositoryFactoryFor ([5c11b6c](https://github.com/loopbackio/loopback-next/commit/5c11b6c))




<a name="0.13.0"></a>
# [0.13.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.12.1...@loopback/repository@0.13.0) (2018-07-09)


### Bug Fixes

* **repository:** make models strict by default ([08c2d89](https://github.com/loopbackio/loopback-next/commit/08c2d89))


### Features

* **cli:** add config and yes options ([5778a2a](https://github.com/loopbackio/loopback-next/commit/5778a2a))
* **repository:** introduce hasmany relation decorator inference ([b267f3c](https://github.com/loopbackio/loopback-next/commit/b267f3c))




<a name="0.12.1"></a>
## [0.12.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.12.0...@loopback/repository@0.12.1) (2018-06-28)




**Note:** Version bump only for package @loopback/repository

<a name="0.12.0"></a>
# [0.12.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.11.4...@loopback/repository@0.12.0) (2018-06-27)


### Features

* add crud relation methods ([1fdae63](https://github.com/loopbackio/loopback-next/commit/1fdae63))




<a name="0.11.4"></a>
## [0.11.4](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.11.3...@loopback/repository@0.11.4) (2018-06-20)


### Bug Fixes

* **repository:** accept class and instance for app.datasource ([4b4270c](https://github.com/loopbackio/loopback-next/commit/4b4270c))
* **repository:** check null for findOne CRUD method ([19f9d61](https://github.com/loopbackio/loopback-next/commit/19f9d61))




<a name="0.11.3"></a>
## [0.11.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.11.2...@loopback/repository@0.11.3) (2018-06-11)




**Note:** Version bump only for package @loopback/repository

<a name="0.11.2"></a>
## [0.11.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.11.0...@loopback/repository@0.11.2) (2018-06-09)




**Note:** Version bump only for package @loopback/repository

<a name="0.11.1"></a>
## [0.11.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.11.0...@loopback/repository@0.11.1) (2018-06-09)




**Note:** Version bump only for package @loopback/repository

<a name="0.11.0"></a>
# [0.11.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.10.4...@loopback/repository@0.11.0) (2018-06-08)


### Bug Fixes

* make the code compatible with TypeScript 2.9.x ([37aba50](https://github.com/loopbackio/loopback-next/commit/37aba50))


### Features

* **repository:** initial hasMany relation impl ([63f20c4](https://github.com/loopbackio/loopback-next/commit/63f20c4))




<a name="0.10.4"></a>
## [0.10.4](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.10.3...@loopback/repository@0.10.4) (2018-05-20)


### Bug Fixes

* move apidocs outside of the function ([940674e](https://github.com/loopbackio/loopback-next/commit/940674e))
* remove mixin builder ([d6942d7](https://github.com/loopbackio/loopback-next/commit/d6942d7))




<a name="0.10.3"></a>
## [0.10.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.10.2...@loopback/repository@0.10.3) (2018-05-14)


### Bug Fixes

* change index.d.ts files to point to dist8 ([42ca42d](https://github.com/loopbackio/loopback-next/commit/42ca42d))




<a name="0.10.2"></a>
## [0.10.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.10.1...@loopback/repository@0.10.2) (2018-05-14)


### Bug Fixes

* multiple instances of the same repository class ([c553f11](https://github.com/loopbackio/loopback-next/commit/c553f11))




<a name="0.10.1"></a>
## [0.10.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.10.0...@loopback/repository@0.10.1) (2018-05-08)




**Note:** Version bump only for package @loopback/repository

<a name="0.10.0"></a>
# [0.10.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.8.1...@loopback/repository@0.10.0) (2018-05-03)


### Features

* add helper package "dist-util" ([532f153](https://github.com/loopbackio/loopback-next/commit/532f153))




<a name="0.9.0"></a>
# [0.9.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.8.1...@loopback/repository@0.9.0) (2018-05-03)


### Features

* add helper package "dist-util" ([532f153](https://github.com/loopbackio/loopback-next/commit/532f153))




<a name="0.8.1"></a>
## [0.8.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.8.0...@loopback/repository@0.8.1) (2018-04-25)




**Note:** Version bump only for package @loopback/repository

<a name="0.8.0"></a>
# [0.8.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.7.0...@loopback/repository@0.8.0) (2018-04-16)




**Note:** Version bump only for package @loopback/repository

<a name="0.7.0"></a>
# [0.7.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.6.1...@loopback/repository@0.7.0) (2018-04-12)


### Features

* **metadata:** add strongly-typed metadata accessors ([45f9f80](https://github.com/loopbackio/loopback-next/commit/45f9f80))




<a name="0.6.1"></a>
## [0.6.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.6.0...@loopback/repository@0.6.1) (2018-04-11)




**Note:** Version bump only for package @loopback/repository

<a name="0.6.0"></a>
# [0.6.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.4.2...@loopback/repository@0.6.0) (2018-04-11)


### Bug Fixes

* change file names to fit advocated naming convention ([0331df8](https://github.com/loopbackio/loopback-next/commit/0331df8))


### Features

* **repository:** add getRepository to mixin ([6e1be1f](https://github.com/loopbackio/loopback-next/commit/6e1be1f))
* **repository:** have [@repository](https://github.com/repository) take in constructor as arg ([3db07eb](https://github.com/loopbackio/loopback-next/commit/3db07eb))




<a name="0.5.0"></a>
# [0.5.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.4.2...@loopback/repository@0.5.0) (2018-04-06)


### Features

* **repository:** add getRepository to mixin ([6e1be1f](https://github.com/loopbackio/loopback-next/commit/6e1be1f))




<a name="0.4.2"></a>
## [0.4.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.4.1...@loopback/repository@0.4.2) (2018-04-04)




**Note:** Version bump only for package @loopback/repository

<a name="0.4.1"></a>
## [0.4.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.4.0...@loopback/repository@0.4.1) (2018-04-02)




**Note:** Version bump only for package @loopback/repository

<a name="0.4.0"></a>
# [0.4.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.3.1...@loopback/repository@0.4.0) (2018-03-29)


### Bug Fixes

* **metadata:** refine clone of decoration spec ([544052e](https://github.com/loopbackio/loopback-next/commit/544052e))
* **repository:** make sure examples are compiled ([b95f1dc](https://github.com/loopbackio/loopback-next/commit/b95f1dc))


### BREAKING CHANGES

* **metadata:** instances of user-defined classes are not cloned any more.

See https://github.com/loopbackio/loopback-next/issues/1182. The root
cause is that DataSource instances are cloned incorrectly.




<a name="0.3.1"></a>
## [0.3.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.3.0...@loopback/repository@0.3.1) (2018-03-23)


### Bug Fixes

* **repository:** fix broken code in readme ([e3e97d9](https://github.com/loopbackio/loopback-next/commit/e3e97d9))




<a name="0.3.0"></a>
# [0.3.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.2.4...@loopback/repository@0.3.0) (2018-03-21)




**Note:** Version bump only for package @loopback/repository

<a name="0.2.4"></a>
## [0.2.4](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.2.3...@loopback/repository@0.2.4) (2018-03-14)




**Note:** Version bump only for package @loopback/repository

<a name="0.2.3"></a>
## [0.2.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.2.2...@loopback/repository@0.2.3) (2018-03-13)




**Note:** Version bump only for package @loopback/repository

<a name="0.2.2"></a>
## [0.2.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.2.1...@loopback/repository@0.2.2) (2018-03-08)




**Note:** Version bump only for package @loopback/repository

<a name="0.2.1"></a>
## [0.2.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.2.0...@loopback/repository@0.2.1) (2018-03-06)


### Bug Fixes

* fix package name for `repository` ([e5f7aca](https://github.com/loopbackio/loopback-next/commit/e5f7aca))
* fix typo of `additional` ([2fd7610](https://github.com/loopbackio/loopback-next/commit/2fd7610))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.1.2...@loopback/repository@0.2.0) (2018-03-01)




**Note:** Version bump only for package @loopback/repository

<a name="0.1.2"></a>
## [0.1.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.1.1...@loopback/repository@0.1.2) (2018-03-01)


### Features

* add repository booter ([#1030](https://github.com/loopbackio/loopback-next/issues/1030)) ([43ea7a8](https://github.com/loopbackio/loopback-next/commit/43ea7a8))
* **context:** add type as a generic parameter to `ctx.get()` and friends ([24b217d](https://github.com/loopbackio/loopback-next/commit/24b217d))
* **repository:** add datasource method in repository mixin ([85347fa](https://github.com/loopbackio/loopback-next/commit/85347fa))


### BREAKING CHANGES

* **context:** `ctx.get()` and `ctx.getSync()` require a type now.
See the example below for upgrade instructions:

```diff
- const c: MyController = await ctx.get('MyController');
+ const c = await ctx.get<MyController>('MyController');
```

`isPromise` was renamed to `isPromiseLike` and acts as a type guard
for `PromiseLike`, not `Promise`.  When upgrading affected code, you
need to determine whether the code was accepting any Promise
implementation (i.e. `PromiseLike`) or only native Promises. In the
former case, you should use `isPromiseLike` and potentially convert the
userland Promise instance to a native Promise via
`Promise.resolve(promiseLike)`. In the latter case, you can replace
`isPromise(p)` with `p instanceof Promise`.




<a name="0.1.1"></a>
## [0.1.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@0.1.0...@loopback/repository@0.1.1) (2018-02-23)




**Note:** Version bump only for package @loopback/repository

<a name="0.1.0"></a>
# [0.1.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.30...@loopback/repository@0.1.0) (2018-02-21)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.30"></a>
# [4.0.0-alpha.30](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.29...@loopback/repository@4.0.0-alpha.30) (2018-02-15)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.29"></a>
# [4.0.0-alpha.29](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.28...@loopback/repository@4.0.0-alpha.29) (2018-02-07)


### build

* drop dist6 related targets ([#945](https://github.com/loopbackio/loopback-next/issues/945)) ([a2368ce](https://github.com/loopbackio/loopback-next/commit/a2368ce))


### BREAKING CHANGES

* Support for Node.js version lower than 8.0 has been dropped.
Please upgrade to the latest Node.js 8.x LTS version.

Co-Authored-by: Taranveer Virk <taranveer@virk.cc>




<a name="4.0.0-alpha.28"></a>
# [4.0.0-alpha.28](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.27...@loopback/repository@4.0.0-alpha.28) (2018-02-04)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.27"></a>
# [4.0.0-alpha.27](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.26...@loopback/repository@4.0.0-alpha.27) (2018-01-30)


### Features

* **repository-json-schema:** add in top-level metadata for json schema ([#907](https://github.com/loopbackio/loopback-next/issues/907)) ([fe59e6b](https://github.com/loopbackio/loopback-next/commit/fe59e6b))




<a name="4.0.0-alpha.26"></a>
# [4.0.0-alpha.26](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.25...@loopback/repository@4.0.0-alpha.26) (2018-01-29)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.25"></a>
# [4.0.0-alpha.25](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.24...@loopback/repository@4.0.0-alpha.25) (2018-01-26)


### Bug Fixes

* apply source-maps to test errors ([76a7f56](https://github.com/loopbackio/loopback-next/commit/76a7f56)), closes [#602](https://github.com/loopbackio/loopback-next/issues/602)
* make mocha self-contained with the source map support ([7c6d869](https://github.com/loopbackio/loopback-next/commit/7c6d869))




<a name="4.0.0-alpha.24"></a>
# [4.0.0-alpha.24](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.23...@loopback/repository@4.0.0-alpha.24) (2018-01-19)


### Features

* add findOne function into legacy juggler bridge ([ee0df08](https://github.com/loopbackio/loopback-next/commit/ee0df08))




<a name="4.0.0-alpha.23"></a>
# [4.0.0-alpha.23](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.22...@loopback/repository@4.0.0-alpha.23) (2018-01-11)


### Bug Fixes

* fix imports to use files owning the definitions ([a50405a](https://github.com/loopbackio/loopback-next/commit/a50405a))
* tidy up the build scripts ([6cc83b6](https://github.com/loopbackio/loopback-next/commit/6cc83b6))




<a name="4.0.0-alpha.22"></a>
# [4.0.0-alpha.22](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.21...@loopback/repository@4.0.0-alpha.22) (2018-01-03)


### Bug Fixes

* update description for [@loopback](https://github.com/loopback)/repository ([6e2377a](https://github.com/loopbackio/loopback-next/commit/6e2377a))




<a name="4.0.0-alpha.21"></a>
# [4.0.0-alpha.21](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.20...@loopback/repository@4.0.0-alpha.21) (2018-01-03)


### Features

* **repository:** helper function for getting Model metadata ([b19635d](https://github.com/loopbackio/loopback-next/commit/b19635d))




<a name="4.0.0-alpha.20"></a>
# [4.0.0-alpha.20](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.19...@loopback/repository@4.0.0-alpha.20) (2017-12-21)


### Features

* **repository:** Add array decorator ([3e7b419](https://github.com/loopbackio/loopback-next/commit/3e7b419))
* **repository:** Make property parameter optional ([a701ce9](https://github.com/loopbackio/loopback-next/commit/a701ce9))




<a name="4.0.0-alpha.19"></a>
# [4.0.0-alpha.19](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.18...@loopback/repository@4.0.0-alpha.19) (2017-12-15)


### Features

* **repository:** Add builders and execute() ([89eaf5f](https://github.com/loopbackio/loopback-next/commit/89eaf5f))
* Add metadata inspector ([c683019](https://github.com/loopbackio/loopback-next/commit/c683019))
* Use decorator factories ([88ebd21](https://github.com/loopbackio/loopback-next/commit/88ebd21))




<a name="4.0.0-alpha.18"></a>
# [4.0.0-alpha.18](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.17...@loopback/repository@4.0.0-alpha.18) (2017-12-11)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.17"></a>
# [4.0.0-alpha.17](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.16...@loopback/repository@4.0.0-alpha.17) (2017-11-29)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.16"></a>
# [4.0.0-alpha.16](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.15...@loopback/repository@4.0.0-alpha.16) (2017-11-14)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.15"></a>
# [4.0.0-alpha.15](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.14...@loopback/repository@4.0.0-alpha.15) (2017-11-09)


### Bug Fixes

* Fix lint errors by newer version of prettier ([d6c5404](https://github.com/loopbackio/loopback-next/commit/d6c5404))




<a name="4.0.0-alpha.14"></a>
# [4.0.0-alpha.14](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.13...@loopback/repository@4.0.0-alpha.14) (2017-11-06)


### Bug Fixes

* **repository:** findById will reject on no result ([04077dc](https://github.com/loopbackio/loopback-next/commit/04077dc))




<a name="4.0.0-alpha.13"></a>
# [4.0.0-alpha.13](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.12...@loopback/repository@4.0.0-alpha.13) (2017-10-31)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.12"></a>
# [4.0.0-alpha.12](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.11...@loopback/repository@4.0.0-alpha.12) (2017-10-31)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.11"></a>
# [4.0.0-alpha.11](https://github.com/loopbackio/loopback-next/compare/@loopback/repository@4.0.0-alpha.8...@loopback/repository@4.0.0-alpha.11) (2017-10-25)




**Note:** Version bump only for package @loopback/repository
