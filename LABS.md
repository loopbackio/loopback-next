# LoopBack Labs

`Labs` is an incubation process to build experimental features and make it easy
for our developers to try out via `npm install`. Such features are usually not
production ready. The design, implementation and APIs may change significantly
over versions. We may graduate or abandon experimental features based on the
community feedback.

## Workflow

We use a convention based git branching strategy to work on experimental
features along with regular ones in `loopback-next` repository.

![loopback-labs](./labs/labs.png)

### Work on an experimental feature

1. Set up local git repository for an experiment feature

```sh
cd loopback-next
git fetch --all
git checkout labs && git checkout -b lab/<my-experimental-feature> && git checkout -b labs-dev/<my-experimental-feature>
git rebase origin/master
```

We add a shell script to provision an experimental feature.

```sh
cd loopback-next
./bin/setup-lab.sh <my-experimental-feature>
```

2. Work on an experimental feature

```sh
cd loopback-next
git checkout labs-dev/<my-experimental-feature>
```

You can now start to make changes, commit them, and push to remote.

3. Rebase the experimental feature branch against master

```
cd loopback-next
git checkout labs-dev/<my-experimental-feature>
git fetch --all
git rebase origin/master
git push --force-with-lease
```

4. Create PR for an experimental feature

- Use `lab/<my-experimental-feature>` as the branch

### Graduate an experimental feature

1. Create a PR from `lab/<my-experimental-feature>` against `master`
2. Follow the code review process to land the PR
