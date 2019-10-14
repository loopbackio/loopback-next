---
lang: en
title: 'Migration guide'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-overview.html
---

As mentioned elsewhere in the documentation, we wrote LoopBack 4 from the ground
up and therefore the migration requires more effort than in previous major
versions. The migration guide presented in the nested pages describe steps to
migrate various features used by typical LoopBack 3 applications.

Unless your project is very small, upgrading everything in one go is most likely
not feasible. It would require too much time and introduce too many breaking
changes to consumers of your API.

We are recommending the following incremental approach:

1. Before you start, learn more about the differences between LoopBack versions
   3 and 4 and build a good understanding of how LoopBack 3 concepts are
   translated to LoopBack 4. See
   [Understanding the differences between LoopBack 3 and LoopBack 4](../Understanding-the-differences.md).

2. Start with mounting your existing LoopBack 3 application in a new LoopBack 4
   project, as described in
   [Mounting a LoopBack 3 application](mounting-lb3app.md). This will allow you
   to build new features in LoopBack 4, while keeping your existing APIs
   unchanged.

3. Next migrate your global (application-level) Express middleware, so that both
   your old and your new APIs can use the same set of middleware. Learn more in
   [Migrating Express middleware](express-middleware.md).

4. Before you can define new models (or import existing ones), you need
   datasources to attach them to. Follow the steps in
   [Migrating datasources](datasources.md) to bring them over to LoopBack 4.

5. With this setup in place, it's time to migrate models. In theory, you can
   migrate models one-by-one, but in practice you will need to migrate related
   models together. We have a dedicated section for model migration, start with
   the overview in [Migrating models](models/overview.md).

Besides models and their APIs, there are few more LoopBack 3 features that
require migration:

1. In LoopBack 3, boot scripts allow the application to run custom code at
   startup. In LoopBack 4, [Lifecycle observers](../Life-cycle.md) allow
   application to run code not only at startup, but also before shutting down.
   Learn how to convert your boot scripts to lifecycle observers in
   [Migrating boot scripts](boot-scripts.md).

2. To make your application secure, LoopBack 3 offers several ways how to
   implement authentication and authorization. Check out
   [Authentication & authorization](auth/overview.md) for an overview and links
   to further resources.

3. LoopBack version 4 has its own CLI tool `lb4` (see
   [Command-line interface](../Command-line-interface.md)). We preserved many of
   the commands you are familiar with in `lb` from LoopBack 3, but some of them
   are different in version 4. Learn more in
   [Migrating CLI usage patterns](cli.md).

4. LoopBack 4 introduced a very different programming model for components and
   extensions. If you are maintaining or using LoopBack 3 components, then you
   should read [Migrating components and extensions](extensions.md).

5. There are several client SDKs for LoopBack 3 that make it easier for
   different clients to consume REST APIs provided by LoopBack applications.
   Please refer to [Migrating clients](clients.md) to learn how to upgrade
   clients built using the SDKs.

Last but not least, we took the opportunity presented by this big release to
abandon certain features and components that we don't have bandwidth to maintain
and improve going forward. Learn more in
[LoopBack 3 features not planned in LoopBack 4](not-planned.md).
