---
lang: en
title: 'Deploying with Cloud Native Buildpacks'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Deploying-with-Cloud-Native-Buildpacks.html
---

This is the common guide for all Cloud Native Buildpacks platforms.

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

## Choosing a Platform

A Cloud Native Buildpack *platform* is a collection of builders and buildpacks
that were designed to work together. Builders designed for "Platform A" cannot
be used buildpacks designed for "Platform B". Each platform may extend the Cloud
Native Buildpacks specification with additional tooling, configuration options,
workflows, etc.

There are currently 3 well-known platforms:

- [Paketo Buildpacks](./Paketo-Buildpacks.md)
- Google Cloud Buildpacks
- Herok Cloud Native Buildpacks


## Writing a Project Descriptor

A developer can create an optional _project descriptor_ to define image
metadata and build configuration, of which the Pack CLI and  some _platforms_
will read to enrich the build process. The project descriptor is typically
stored in `project.toml` at the root of the project.

A typical project descriptor may look like this:

{% include code-caption.html content="project.toml" %}
```toml
# The properties listed below is a non-exhaustive list that is intepreted by the
# Pack CLI and are *completely optional*. Some platforms may accept and/or
# mandate additional properties for build configuration. Please consult the
# respective documentation.

# Pack CLI arguments *always* take precedence over this file.

[project]
id = "io.loopback.todo-app" # machine readable
name = "Todo App" # human readable
version = "1.0.0"
authors = ["The LoopBack 4 Authors"]
documentation-url = "https://github.com/strongloop/loopback-next/tree/master/examples/todo/README.md"
source-url = "https://github.com/strongloop/loopback-next/tree/master/examples/todo/"
```

Some platforms may support additional configuration via the project descriptor.
Regardless of platform support, the Pack CLI always recognise common parameters.

Consult the
[project descriptor specification](https://github.com/buildpacks/spec/blob/main/extensions/project-descriptor.md)
and the respective platform's documentation for a list of accepted properties.
