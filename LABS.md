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

1. **Set up local git repository for an experiment feature**

- 1.1 Create experimental branch and dev branch

```sh
cd loopback-next
git fetch --all
git checkout labs/base && git checkout -b labs/<my-experimental-feature> && git checkout -b labs-dev/<my-experimental-feature>
git rebase origin/master
```

Or you can execute the following shell script to provision your experimental feature. It does the same setup as the commands above.

```sh
cd loopback-next
./bin/setup-lab.sh <my-experimental-feature>
```

- 1.2 Enable tests in `/labs/*` only

To enable the test in `/labs/*` only and skip running unrelated tests in the production ready packages, you can change the mocha test script to

```
{
  "scripts": {
    "mocha": "node packages/build/bin/run-mocha \"labs/*/dist/__tests__/**/*.js\"
  }
}
```

in the root directory's `package.json` file.

Now all the setup of the experimental branch have been finished! You can push the local changes and start to create PRs from the development branch.

2. **Work on an experimental feature**

```sh
cd loopback-next
git checkout labs-dev/<my-experimental-feature>
```

You can now start to make changes, commit them, and push to remote.

3. **Rebase the experimental feature branch against master**

To get the latest change from master, you can rebase your dev branch:

```
cd loopback-next
git checkout labs-dev/<my-experimental-feature>
git fetch --all
git rebase origin/master
git push --force-with-lease
```

If you want to have a clean commit history in your PR without the noisy commits from the master branch, make sure branch `/labs/base` is rebased against master and `/labs/<my-experimental-feature>` is rebased against `/labs/base`.

4. **Release for an experimental feature**

- Use `0.x.y` versioning scheme
- Use `labs/<my-experimental-feature>` as the branch

*The release script to be created*

### Graduate an experimental feature

1. Create a PR from `labs/<my-experimental-feature>` against `master`
2. Remove the lab setup commits from `/labs/base`
3. Update the entries/links in [add a new package](https://github.com/strongloop/loopback-next/blob/master/docs/site/DEVELOPING.md#adding-a-new-package)
4. Update the `CODEOWNERS` file in the root folder: add the graduated package and owners' names
5. Follow the code review process to land the PR
