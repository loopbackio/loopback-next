---
lang: en
title: 'Deploying with Paketo Buildpacks'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Deploying-with-Paketo-Buildpacks.html
---

This comprehensive guide will show how to prepare a LoopBack 4 application for
deployment with [Paketo Buildpacks](https://paketo.io), a
[platform](https://github.com/buildpacks/spec/blob/main/platform.md)
implementation of [Cloud Native Buildpacks](https://buildpacks.io).

## Benefits of Cloud Native Buildpacks

Cloud Native Buildpacks is a CNCF project that aims to support 2 personas: the
_developers_, and the _operators_. For developers, It abstracts away the
contents of a Dockerfile, and introduces the concepts of Builders and Buidpacks;
This accelerates development as the developers' focus is shifted towards app
development and enables reuse of existing layers (i.e. `node_modules` directory
or the Node.js binary). For operators, it provides control to keep track and
inventory the underlying image, and quickly "rebase" and publish a new image
without developer intervention when needed (i.e. a new vulnerability in Ubuntu).

## Prerequisites

You'll need the following:

1. [Node.js LTS](https://nodejs.org)
2. [Docker Desktop](https://www.docker.com/products/docker-desktop)
3. [Pack CLI](https://buildpacks.io/docs/tools/pack/)
4. [LoopBack 4 CLI](https://loopback.io/getting-started.html)

## Preparing a Project

### Writing a Project Descriptor

While optional, a developer can create a _project descriptor_ to define image
metadata and build configuration, of which the Pack CLI and  some _platforms_
will read to enrich the build process. The project descriptor is typically
stored in `project.toml` at the root of the project.

A typical project descriptor may look like this:

{% include code-caption.html content="project.toml" %}
```toml
# The properties listed below is a non-exhaustive list that is intepreted by the
# Pack CLI and are *completely optional*. Some platforms may accept and/or
# mandate additional properties for build configuration. Please consult the
# respective documentation. Paketo *does not* accept any additoinal properties.

# Pack CLI arguments *always* take precedence over this file.

[project]
id = "io.loopback.todo-app" # machine readable
name = "Todo App" # human readable
version = "1.0.0"
authors = ["The LoopBack 4 Authors"]
documentation-url = "https://github.com/strongloop/loopback-next/tree/master/examples/todo/README.md"
source-url = "https://github.com/strongloop/loopback-next/tree/master/examples/todo/"

# Used to include or exclude files in the build image.
# Useful for controlling the install procedure (discussed later in this guide).
[build]
exclude = [
    "README.md",
    "bash-script-buildpack"
]
```

Some platforms may support additional configuration via the project descriptor.
While Paketo does not leverage this file for additional configuration, the Pack
CLI will still recognise common parameters and create the relevant image
labels.

Consult the
[project descriptor specification](https://github.com/buildpacks/spec/blob/main/extensions/project-descriptor.md)
and the respective platform's documentation for a list of accepted properties.

### Deciding on a Builder

{% include note.html content="This section is Paketo-specific. When using
another platform, consult the respective documentation for a list of supported
builders." %}

Builders are the common build and runtime environments shared by the platform's
buildpacks. Paketo Buildpacks provides
[3 builders](https://paketo.io/docs/builders/): _Full_, _Base_, and _Tiny_. The
Node.js buildpack is supported with the _Full_ and _Base_ builders. If possible,
use the _Base_ builder. If the project has issues starting, use the _Full_
builder instead.

The choice of builder will be defined when
[building the project](#Building-a-Project).

### Vendoring Dependencies

Vendoring dependnencies is the inclusion of a preinstalled copy of
`node_modules` that was created before building the image. Vendoring
dependencies can be beneficial as it removes the dependence on connectivity to a
registry, and ensures that the exact same copies of the dependencies are used.

To vendor dependencies, generate `node_modules` before building the image and
ensure that it's not excluded.

### Updating the Node.js Start Command Hook

{% include note.html content="This section is Paketo-specific. When using a
different platform, please consult their documentation on their behavior." %}

The Node.js Paketo Buildpack utilizes the `start` property of `package.json` to
start the Node.js application during runtime. The default LoopBack 4
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

### Building Artifacts During Image Build

{% include note.html content="This section is Paketo-specific. When using a
different platform, please consult their documentation on their behavior." %}

{% include note.html content="Skip this step when using prebuilt artifacts." %}

The Paketo Node.js Buildpack will only run the `rebuild` script
[under certain circumstances](https://paketo.io/docs/buildpacks/language-family-buildpacks/nodejs/#npm-installation-process).
If the `rebuild` command won't be executed, and the project will not be prebuilt
before running `pack build`, the project's `package.json` `install` hook must be
modified to force a rebuild:

{% include code-caption.html content="/package.json" %}

```diff
{
  "scripts": {
+    "postinstall": "npm run rebuild"
  }
}
```

The side-effect is that the LoopBack 4 project will rebuild when executing
`npm install` or `npm ci`. To prevent a rebuild, add the `--ignore-scripts`
flag:

```sh
# Update/create package-lock.json
$ npm install --ignore-scripts

# Use package-lock.json
$ npm ci --ignore-scripts
```

Furthermore, `@loopback/build` must be promoted to a non-development dependency:

{% include code-caption.html content="/package.json" %}

```diff
{
  "dependencies": {
+    "@loopback/build": <...>"
  },
  "devDependencies": {
-    "@loopback/build": <...>"
  }
}
```

### Configuring the Node.js Engine

{% include important.html content="This is a Paketo-specific feature and is not
part of the Cloud Native Buildpacks specification. Please consult the respective
platform documentation for how to achieve the same configuration." %}

Paketo Buildpacks introduces a common `buildpack.yml` file that can be created
at the root directory of the project. This can be used to pass runtime
configuration to the buildpacks.

The [Node.js Buildpack](https://github.com/paketo-buildpacks/nodejs) consists of
a collection of collaborating buildpacks, of which only the
[Node Engine Buildpack](https://github.com/paketo-buildpacks/node-engine#buildpackyml-configurations)
supports additional runtime configuration:

{% include code-caption.html content="/buildpack.yml" %}

```toml
nodejs:
  # this allows you to specify a version constraint for the node depdendency
  # any valid semver constaints (e.g. 14.*) are also acceptable
  version: ~14

  # allow node to optimize memory usage based on your system constraints
  # bool
  optimize-memory: true
```

## Building a Project

{% include important.html content="Some buildpacks, such as
[Paketo](https://paketo.io/docs/buildpacks/language-family-buildpacks/nodejs/#npm-installation-process), will execute different installation procedures
depending on the existence of certain files (i.e. `package-lock.json`,
`node_modules`, `npm-cache`). Use the
[project descriptor](#Writing-a-Project-Descriptor) to control which files are
included in the build process. Please consult the respective platform
documentation on its behavior.

To understand how to leverage this behavior, see
[Building Artifacts During Image Build](#Building-Artifacts-During-Image-Build)
and [Vendoring Dependencies](#Vendoring-Dependencies)."
%}

{% include important.html content="`pack build` will override any image with
a conflicting name without warning." %}

To build a project, use the Pack CLI to define the build parameters:

```sh
$ pack build todo-app \
>   --buildpack gcr.io/paketo-buildpacks/nodejs \
>   # Replace this line with the "Full" builder if necessary:
>   --builder paketobuildpacks/builder:base
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

To utilize a project descriptor, use the `--descriptor` option. For example:

```sh
$ pack build todo-app \
>   --buildpack gcr.io/paketo-buildpacks/nodejs \
>   # Replace this line with the "Full" builder if necessary:
>   --builder paketobuildpacks/builder:base \
>   # Use a project descriptor
>   --descriptor ./project.toml
```

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
