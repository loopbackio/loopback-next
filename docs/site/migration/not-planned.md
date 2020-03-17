---
lang: en
title: 'LoopBack 3 features not planned in LoopBack 4'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-not-planned.html
---

{% include tip.html content="
Missing instructions for your LoopBack 3 use case? Please report a [Migration docs issue](https://github.com/strongloop/loopback-next/issues/new?labels=question,Migration,Docs&template=Migration_docs.md) on GitHub to let us know.
" %}

In the early days of LoopBack, we were exploring different functional areas to
find features that would make the framework compelling to a wide audience. Some
of those feature become popular, other not so much. In the meantime, the world
has moved on and many paradigms popular back in 2013-2015 have been superseded
by better ideas.

Additionally, the community of LoopBack maintainers was not growing fast enough
to support the wide spectrum of features offered by LoopBack. As a result, most
extensions were not integrated well together and many of them are becoming
outdated by now.

In order to keep the project sustainable and offer great developer experience to
framework users, we decided to sunset several LoopBack 3 extensions and
features. We are encouraging our community step up and take over development of
these extensions.

## Storage component

[loopback-component-storage](https://loopback.io/doc/en/lb3/Storage-component.html)
provides a unified REST API for storing and retrieving arbitrary files, using
3rd-party storage like Amazon S3.

Essentially, this component has the following parts:

1. A custom layer to handle file uploads
2. A custom layer to handle file downloads
3. Connectors to different storage services (this part is handled by
   [pkgcloud](https://www.npmjs.com/package/pkgcloud) package)
4. Integration layer providing File and Container abstractions with REST API.

In LoopBack 4, you can implement a similar functionality as follows:

1. Use `x-parser: stream` extension to receive request body as a stream, and
   [multer](https://www.npmjs.com/package/multer) package to deal with
   multi-part file uploads. Check out our
   [File Upload/Download Example](https://github.com/strongloop/loopback-next/tree/master/examples/file-transfer)
   for a fully working application.

2. LoopBack 4 does not provide first-class support for file downloads yet, see
   [loopback-next#2230](https://github.com/strongloop/loopback-next/issues/2230).
   As a workaround, you can inject the full Express response object and use
   Express API to stream the response body. Find more details in the discussion
   in the linked GitHub issue, check out our
   [File Upload/Download Example](https://github.com/strongloop/loopback-next/tree/master/examples/file-transfer)
   for a fully working application.

3. To connect to your cloud storage provider, you can use `pkgcloud` or directly
   the Node.js client library provided by your provider. You may want to check
   [multer-storage-pkgcloud](https://github.com/dustin-H/multer-storage-pkgcloud)

4. Finally, create a [Service](../Services.md) providing File and Container APIs
   in TypeScript and one or more [Controllers](../Controllers.md) to implement
   the REST API.

_If you are happy with the outcome, then please consider packaging your code as
a [LoopBack Component](../Creating-components.md) and sharing your great work
with the entire LoopBack community. We are happy to promote it in our
documentation, just submit a pull request to add your component to
[Using components](../Using-components.md)._

## Push notifications

[loopback-component-push](https://loopback.io/doc/en/lb3/Push-notifications.html)
enable server applications to send information to mobile apps even when the app
isn’t in use.

The component consists of the following parts (see
[Architecture](https://loopback.io/doc/en/lb3/Push-notifications.html#architecture)):

1. Device model and APIs to manage devices with applications and users.
2. Application model to provide push settings for device types such as iOS and
   Android.
3. Notification model to capture notification messages and persist scheduled
   notifications.
4. Optional job to take scheduled notification requests.
5. Push connector that interacts with device registration records and push
   providers APNS for iOS apps and GCM for Android apps.
6. Push model to provide high-level APIs for device-independent push
   notifications.

In LoopBack 4, you can re-create a similar functionality as follows:

- Implement models, repositories and controllers to provide Device and
  Application model.
- Implement a [Service](../Services.md) to provide TypeScript API for sending
  notifications and persisting scheduled notifications to be sent later. You can
  use packages like [apn](https://www.npmjs.com/package/apn) and
  [node-gcm](https://www.npmjs.com/package/node-gcm) to interact with Apple's
  and Google's push notification services.

## Offline data access and synchronization

[Synchronization](https://loopback.io/doc/en/lb3/Synchronization.html) component
allows browser clients to access and modify data while in offline mode, and then
synchronize (replicate) changes made both on the client and on the server when
the client comes online again.

The implementation in LoopBack 3 is complex and tightly integrated with the
built-in persistence layer, which makes it very difficult is to migrate such
functionality to LoopBack 4's programming model.

If you are interested in offline data access, then we recommend you to research
specialized solutions tailored for the database server you are using for
persisting your data. Few pointers to bootstrap your search:

- [MongoDB Realm](https://www.mongodb.com/realm) provides two-way and
  offline-first sync for MongoDB Atlas.
- [pouchdb](https://pouchdb.com) enables applications to store data locally
  while offline, then synchronize it with CouchDB and compatible servers when
  the application is back online.
- [GUN](https://gun.eco) a is a small, easy, and fast data sync and storage
  system providing offline-first capabilities.
