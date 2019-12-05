# Jan milestone

## Overview

- Take some time to:
  - fix bugs, improve developer experience, fix docs
  - triage open issues across all the repos, not just `loopback-next`
- Migration work continues to be one of the focus
- Focus on issues/PRs for loopback-connector-mongodb

## Goals

- [ ] Improve developer experience

  - [ ] [3] Expose isActive() method in Transaction interface #3471
  - [ ] [3] Missing model.ts after running lb4 openapi command #4135
  - [ ] [2] Model strict: false is ignored with Postgre SQL repository #4042

- [ ] Bugs

  - [ ] [3] Docs: Improve TodoList Tutorial instructions and completed tutorial
        'lb4 example todo-list' #4161
  - [ ] [Needs Estimates] lb3 - Relations on uuid
        https://github.com/strongloop/loopback/issues/4287

- [ ] Migration guide between LB3 and LB4 MVP #453

  - [ ] [3] How to migrate datasources from LB3 to LB4 #3946
  - [ ] [3] How to migrate boot scripts #3957

- [ ] From model definition to REST API with no custom repository/controller
      classes #2036

  - [ ] [3]Add CrudRestApiBuilder to @loopback/rest-crud #3737
  - [ ] [3]Example app showing CrudRestApiBuilder #3738

- [ ] [3][spike] API Connect / LoopBack 4 integration #4115

- [ ] [Needs estimates] chore: update dependency change-case to v4 #4233

## Stretch goals

- [ ] Spike: migrate tests to Jest (ts-jest) #3159

- [ ] Migration guide between LB3 and LB4 MVP #453

  - [ ] [3] How to migrate user-defined model methods #3949
  - [ ] [5] How to migrate remoting hooks #3950

- Bugs

  - [ ][community contribution?] Preserve custom type of auto-generated id
    property #3602
  - [ ] [needs discussion] Column names in lowercase using lb4 discover method -
        SQL connector #3343

- PR reviews
  - [ ] feat(extension-logging): add integration with winston and fluentd
        logging, https://github.com/strongloop/loopback-next/pull/4117
  - [ ] chore: enable esModuleInterop compiler option,
        https://github.com/strongloop/loopback-next/pull/4091
  - [ ] [RFC] feat: add base code for the image of Appsody LoopBack stack,
        https://github.com/strongloop/loopback-next/pull/4250
