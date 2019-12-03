# Jan milestone

## Overview

- Take some time to:
  - fix bugs, improve developer experience, fix docs
  - triage open issues across all the repos, not just `loopback-next`
- Migration work continues to be one of the focus

## Goals

- [ ] Improve developer experience

  - [ ] [3] Expose isActive() method in Transaction interface #3471
  - [ ] [3] Missing model.ts after running lb4 openapi command #4135
  - [ ] [2] Model strict: false is ignored with Postgre SQL repository #4042
  - [ ] [needs estimates] Column names in lowercase using lb4 discover method -
        SQL connector #3343

- [ ] Bugs

  - [ ] [3] Docs: Improve TodoList Tutorial instructions and completed tutorial
        'lb4 example todo-list' #4161

- [ ] Migration guide between LB3 and LB4 MVP #453

  - [ ] [3] How to migrate datasources from LB3 to LB4 #3946
  - [ ] [3] How to migrate boot scripts #3957
  - [ ] [3] How to migrate user-defined model methods #3949
  - [ ] [5] How to migrate remoting hooks #3950

- [ ] From model definition to REST API with no custom repository/controller
      classes #2036

  - [ ] [3]Add CrudRestApiBuilder to @loopback/rest-crud #3737
  - [ ] [3]Example app showing CrudRestApiBuilder #3738

- [ ] [3][spike] API Connect / LoopBack 4 integration #4115

## Stretch goals

- [ ] Spike: migrate tests to Jest (ts-jest) #3159
