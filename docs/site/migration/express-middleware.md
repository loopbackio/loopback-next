---
lang: en
title: 'Migrating Express middleware'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-express-middleware.html
---

{% include tip.html content="
Missing instructions for your LoopBack 3 use case? Please report a [Migration docs issue](https://github.com/strongloop/loopback-next/issues/new?labels=question,Migration,Docs&template=Migration_docs.md) on GitHub to let us know.
" %}

Migrating Express middleware from LoopBack 3 (LB3) application to LoopBack 4
(LB4) application requires the use of a base Express application that will mount
the LB4 application, which in turn mounts the LB3 application.

The base Express application presents the mounting point for the middleware that
will be shared by the LB3 and LB4 applications.

## Migrating LB3 Express middleware

[This tutorial](https://github.com/strongloop/loopback-next/tree/master/examples/lb3-application/README.md)
shows the Express middleware migration process in two steps:

1. Mounting LB3 application on LB4 application
2. Migrating Express middleware from LB3 application

To see an example of a LB3 application that has been mounted on a LB4
application and has its Express middleware migrated to a common location, see
[lb3-application](https://github.com/strongloop/loopback-next/tree/master/examples/lb3-application).
