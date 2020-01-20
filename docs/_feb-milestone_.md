## Monthly Milestone - Feb 2020

### Overview

- Continue focus on migration guide
- Further investigation on the APIC/LB integration

### Goals

- Migration guide between LB3 and LB4 MVP #453

  - [ ] (3) How to migrate CRUD Operation Hooks #3952
  - [ ] (8) How to migrate model mixins #3951
  - [ ] (3) Spike: how to import LB3 models extending a custom base model #3813
  - [ ] (needs estimate) [migration/auth] Migrate
        https://github.com/strongloop/loopback-example-access-control to LB4
        #4520

- Tooling around migration

  - [ ] (3) LB3 model import: preserve connector-specific metadata in property
        definitions #3810

- Create models & REST APIs dynamically at runtime

  - [ ](8) How to build models, repositories and controllers dynamically at
    runtime #4296

- Shopping app web site

  - [ ] (2) Shopping App Website: Installation/setup documentation
        https://github.com/strongloop/loopback4-example-shopping/issues/477

- APIC Integration #4516

  - [ ] (5) [Spike] End to End test Shopping example in cloud with APIConnect
        #4498

- Miscellaneous

  - [ ] (3) Run shared tests from both v3 and v4 of juggler
        https://github.com/strongloop/loopback-connector-db2/issues/133
  - [ ] (3) Add CrudRestApiBuilder to `@loopback/rest-crud` #3737
  - [ ] (8) Column names in lowercase using lb4 discover method - SQL connector
        #3343

- PR reviews:
  - [ ] feat: adds @deprecated convenience decorator #4415
  - [ ] feat: adds @tags convenience decorator #4416
  - [ ] feat: adds utility launch for debugging a single test file #4432
  - [ ] Preserve custom type of auto-generated id property #4270

### Stretch Goals

- CI

  - [ ] [CI] Postgresql downstream tests failed
        https://github.com/strongloop/loopback-datasource-juggler/issues/1816
  - [ ] [DashDB] Run shared tests from both v3 and v4 of juggler
        https://github.com/strongloop/loopback-connector-dashdb/issues/79

- Bug fixes

  - [ ] Authorizer triggers twice #4351
  - [ ] Belongs-To relation tries to resolve for foreign key NULL #4372
  - [ ] Log extension is not printing any logs #2173

- Migration guide between LB3 and LB4 MVP #453
  - [ ] Which official LB3 components are not planned in LB4 #3956
  - [ ] (8) Migration Guide: Discuss life cycle differences between LB3 and LB4
        #3935
  - [ ] (3) How to map LB3 CLI commands to LB4 CLI #3953

### "Help wanted" and "Good first issue"

_Community contributors: Want to contribute but don't know where to start? Here
is our wish list for the next month:_

- [ ] Add bearer auth scheme as the default security scheme #4386
- [ ] https://github.com/strongloop/loopback-next/issues/4380
