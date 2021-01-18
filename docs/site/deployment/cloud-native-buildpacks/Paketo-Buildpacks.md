---
lang: en
title: 'Deploying with Paketo Buildpacks'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Deploying-with-Paketo-Buildpacks.html
---

{% include important.html content="Please read
[Deploying with Cloud NativeBuildpacks](./Cloud-Native-Buildpacks.md)" %}

{% include note.html content="This guide contains some Paketo-specific
documentation." %}

This quickstart guide will show how to prepare a LoopBack 4 application for
deployment with [Paketo Buildpacks](https://paketo.io), a
[platform](https://github.com/buildpacks/spec/blob/main/platform.md)
implementation of [Cloud Native Buildpacks](https://buildpacks.io).

## Preparing a Project

Before continuing, please follow the steps in
[Deploying with Cloud Native Buildpacks](./Cloud-Native-Buildpacks.md).

### Deciding on a Builder

Builders are the common build and runtime environments shared by the platform's
buildpacks. Paketo Buildpacks provides
[3 builders](https://paketo.io/docs/builders/): _Full_, _Base_, and _Tiny_. The
Node.js buildpack is supported with the _Full_ and _Base_ builders. If possible,
use the _Base_ builder. If the project has issues starting, use the _Full_
builder instead.

The choice of builder will be defined when
[building the project](#Building-a-Project).

### Updating the Node.js Start Command Hook

The Node.js Paketo Buildpack utilizes the `start` property of `package.json` to
start the Node.js application during runtime. The default generated LoopBack 4
`package.json` will attempt to rebuild the application before starting. This
may cause an unecessary reubuild and longer time to deployment as artifacts
should only be built when building the image. It will also prevent the project
from starting up if `@loopback/build` is not promoted to a production
dependency.

To fix this, remove the `prestart` hook:

{% include code-caption.html content="/package.json" %}

```diff
{
  "scripts": {
-    "prestart": "npm run rebuild"
  }
}
```

The side-effect is that project will no longer rebuild when running `npm start`.
To keep this feature, add a new wrapper start script and replace the hook:

{% include code-caption.html content="/package.json" %}

```diff
{
  "scripts": {
-    "prestart": "npm run rebuild"
+    "start:dev": "npm run start"
+    "prestart:dev": "npm run rebuild"
    "
  }
}
```

This will retain the rebuild hook when running `npm run start:dev`. The scripts
can be renamed to your liking.

### Configuring the Node.js Engine

Paketo Buildpacks introduces a common `buildpack.yml` file that can be created
at the root directory of the project. This can be used to pass runtime
configuration to the buildpacks.

Populate `buildpack.yml` as follows:

{% include code-caption.html content="/buildpack.yml" %}

```yaml
nodejs:
  optimize-memory: true
```

## Setting Up the Project Descriptor

The Paketo Node.js Buildpack will execute different build commands depending on
[the existence of certain files/directories](https://paketo.io/docs/buildpacks/language-family-buildpacks/nodejs/#npm-installation-process). To ensure a
consistent build pipeline, add the following to the project descriptor:

```toml
[build]
exclude = [
    "node_modules"
]
```

Furthermore, the choice of buildpack should be defined:

```toml
[[build.buildpacks]]
uri = "gcr.io/paketo-buildpacks/nodejs"
```

## Building a Project

{% include important.html content="`pack build` will override any image with
a conflicting name without warning." %}

To build a project, use the Pack CLI to define the build parameters:

```sh
$ pack build todo-app \
>   # Replace this line with the "Full" builder if necessary:
>   --builder paketobuildpacks/builder:base\
>   --descriptor ./project.toml
```

{% include tip.html content="Tired of specifying the builder every time?
Consider setting a default builder:
```sh
# Pack CLI pre-v0.16
$ pack set-default-builder paketobuildpacks/builder:base
# Pack CLI v0.16 onwards (see: https://github.com/buildpacks/pack/pull/982)
$ pack config default-builder paketobuildpacks/builder:base
```
" %}

The Pack CLI would have pulled several container layers, built the project, and
exported an image:

```sh
# <Truncated for bevity>
Setting default process type 'web'
*** Images (a472d8276f1c):
      todo-app
Adding cache layer 'paketo-buildpacks/node-engine:node'
Adding cache layer 'paketo-buildpacks/npm-install:modules'
Adding cache layer 'paketo-buildpacks/npm-install:npm-cache'
Successfully built image todo-app
```
{% include note.html content="The exported image will have a timestamp of
`January 1, 1980 00:00:01`. This is
[expected behavior](https://medium.com/buildpacks/time-travel-with-pack-e0efd8bf05db)."
%}

## Locally-Running the Project

We can utilize `docker run` to start the project locally:

```sh
$ docker run \
>   --publish=8080:8080 \
>   --env='PORT=8080' \
>   todo-app
```

This command will start the LoopBack 4 application from our newly-created image,
set the listening port to `8080` and make it accesible to the local machine.

{% include note.html content="By default, LoopBack 4 applications will utilize
the `PORT` environment variable to set the listening port. If the above command
does not work, make sure that the code in the `Application` class is correct."
%}

## Publishing a Project

After local development, the developer may want to publish the project to a
container registry. The Pack CLI provides a built-in command to build and
publish via `pack build --publish`.

{% include important.html content="`pack build --publish` cannot be substituted
with `pack build <...> && docker publish <...>`. See
[Reproducible Builds](https://buildpacks.io/docs/reference/reproducibility/#consequences-and-caveats) for more details." %}

## Rebasing a Project

To update the underlying image layers, use the `pack rebase <image-name>`
command. Add the `--publish` option to rebase and push the new image to the
container registry.
