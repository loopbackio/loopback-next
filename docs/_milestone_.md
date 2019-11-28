# December Milestone

## Overview

- Complete the epics:
  - `Add Support for Partitioned Database`
  - `Inclusion of related models`
  - `Production deployment`
- Complete the spikes for the migration guide
- Community Support: focus on triaging and PR reviews in
  `loopback-datasource-juggler` and/or `loopback-connector-postgresql`
- Time off for Christmas and New Year!

## Goals

- [ ] Inclusion of related models [MVP]
      https://github.com/strongloop/loopback-next/issues/1352

  - [ ] [5]Reject create/update requests when data contains navigational
        properties (WIP) https://github.com/strongloop/loopback-next/issues/3439

- [ ] Authentication & Authorization
      https://github.com/strongloop/loopback-next/issues/3902

  - [ ] [5]Contribute OpenAPI spec pieces from extensions
        https://github.com/strongloop/loopback-next/issues/3854
  - [ ] [3]Add user profile factory for authentication modules
        https://github.com/strongloop/loopback-next/issues/3846

- [ ] Add Support for Partitioned Database
      https://github.com/strongloop/loopback-connector-cloudant/issues/219

  - [ ] [3] Blog post
        https://github.com/strongloop/loopback-connector-cloudant/issues/231

- [ ] From model definition to REST API with no custom repository/controller
      classes https://github.com/strongloop/loopback-next/issues/2036

  - [ ] [5]Model API booter & builder(WIP)
        https://github.com/strongloop/loopback-next/issues/3736

- [ ] Migration guide between LB3 to LB4 [MVP]
      https://github.com/strongloop/loopback-next/issues/453

  - [ ] [3]Spike: Migration guide from LB3 - Authentication & authorization
        https://github.com/strongloop/loopback-next/issues/3719

- [ ] Miscellaneous
  - [ ] [8]Spike: Discover and define models at runtime
        https://github.com/strongloop/loopback-next/issues/2484
  - [ ] [5] API Explorer ignores filter options where, fields, and order #2208

## Stretch Goals

- [ ] Bug fixes

  - [ ] Id deleted on update on MongoDB #3267
  - [ ] TodoList tutorial - GET ​/todos​/{id}​/todo-list gives unexpected
        response #4147
  - [ ] lb4 repository,model,controller commands generate artifacts with 'lint'
        issues https://github.com/strongloop/loopback-next/issues/4205

- [ ] Inclusion of Related Models (Post MVP)

  - [ ] Include related models with a custom scope #3453

- [ ] From model definition to REST API with no custom repository/controller
      classes https://github.com/strongloop/loopback-next/issues/2036

  - [ ] [3]Add CrudRestApiBuilder to `@loopback/rest-crud`,
        https://github.com/strongloop/loopback-next/issues/3737
  - [ ] [3]Example app showing CrudRestApiBuilder
        https://github.com/strongloop/loopback-next/issues/3738

- [ ] Migration guide between LB3 to LB4 [MVP]
      https://github.com/strongloop/loopback-next/issues/453

  - [ ] [3]How to migrate datasources from LB3 to LB4 #3946
  - [ ] [3]How to migrate boot scripts #3957
  - [ ] [3]How to migrate user-defined model methods #3949

- Micellaneous
  - [ ] [5]Column is always integer when running `npm run migrate`
        https://github.com/strongloop/loopback-next/issues/2398
