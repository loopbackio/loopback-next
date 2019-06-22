---
lang: en
title: 'Glossary'
keywords: LoopBack 4.0, LoopBack 4
toc_level: 1
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Glossary.html
---

**Action**: JavaScript functions that only accept or return Elements. Since the
input of one action (an Element) is the output of another action (Element) they
are easily composed.

**API specification**: An [OpenAPI](https://www.openapis.org) document (in YAML
or JSON format) that describes a REST API. It specifies the metadata (verbs,
paths, headers, and so on) a client needs to make a valid request to the API.

**Application**: A container of components.

**Component**: A reusable bundle of Bindings, [Controllers](Controllers.md),
Services, [Repositories](Repositories.md), and models. For more information, see
[Using components](Using-components.md) and
[Creating components](Creating-components.md).

**Connector**: An interface that abstracts underlying backend systems (for
example, database, web service, and so on).

**Context**: An encapsulation of request and response objects provides useful
values for writing web applications and APIs. For more information, see
[Context](Context.md).

**Controller**: The implementation of API endpoints.

**DataSource**: A named configuration for a Connector instance that represents
data in an external system. For more information, see
[DataSource](DataSource.md).

**Element:** The building blocks of a Sequence, such as route, params, and
result. For more information, see [Sequence](Sequence.md#elements).

**Mixin**: An interface for models.

**Model**: Defines application data and how it is connected to other data.

**Sequence**: A stateless grouping of actions that control how an Application
responds to requests.

**Service**: Operations implemented in an external system.

**Repository**: A type of Service that represents a collection of data within a
DataSource. For more information, see [Repositories](Repositories.md).
