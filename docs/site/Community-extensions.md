---
lang: en
title: 'Community extensions'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Extensions
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Community-extensions.html
---

In addition to the extensions that LoopBack provides and maintains, there are a
number of extensions created by the open source community.

To create a LoopBack extension, see
[Extending LoopBack 4 documentation page](https://loopback.io/doc/en/lb4/Extending-LoopBack-4.html)
for details. It is recommended to use the
[extension generator](https://loopback.io/doc/en/lb4/Extension-generator.html)
to scaffold a new extension.

The following table lists some of the community extensions. See
[npmjs.org](https://www.npmjs.com/search?q=loopback4%20extension) for a complete
list.

{% include warning.html content="The extensions listed here are not supported by the LoopBack team; they are maintained by the LoopBack community and are listed here for convenience."%}

## General

<table>
  <thead>
    <tr>
      <th width="160">Extension</th>
      <th width="280">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="https://www.npmjs.com/package/loopback4-soft-delete">loopback4-soft-delete</a></td>
      <td>Adds soft-delete feature to your models and repositories</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/loopback4-helmet">loopback4-helmet</a></td>
      <td>Integrate <a href="https://helmetjs.github.io/">helmetjs</a> in LoopBack applications</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/loopback4-ratelimiter">loopback4-ratelimiter</a></td>
      <td>Provide rate limiting in LoopBack applications</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/loopback4-notifications">loopback4-notifications</a></td>
      <td>Add different notification mechanisms vis-à-vis, Push, SMS, Email, to any LoopBack 4 based REST API application or microservice</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/loopback4-s3">loopback4-s3</a></td>
      <td>Integrate AWS S3 in LoopBack applications</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/loopback-component-history">loopback-component-history</a></td>
      <td>Soft create, edit, delete models, saving history of changes</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/loopback-component-filter">loopback-component-filter</a></td>
      <td>Filter models in repository layer, using an async function</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/@sourceloop/vault">@sourceloop/vault</a></td>
      <td>HashiCorp's Vault integration in loopback applications</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/@sourceloop/audit-log">@sourceloop/audit-log</a></td>
      <td>Implement audit logs in loopback applications for all DB transactions</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/loopback-rabbitmq">loopback-rabbitmq</a></td>
      <td>An Rabbitmq extension that implements Queue consumers and producers</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/loopback4-dynamic-datasource">loopback4-dynamic-datasource</a></td>
      <td>Connect data sources dynamically during runtime</td>
    </tr>
    <tr>
      <td><a href="https://npmjs.com/package/loopback4-kafka-client">loopback4-kafka-client</a></td>
      <td>Kafka Client built on top of KafkaJs</td>
    </tr>
  </tbody>
</table>

## Authentication and authorization related extensions

<table>
  <thead>
    <tr>
      <th width="160">Extension</th>
      <th width="280">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="https://www.npmjs.com/package/loopback4-authentication">loopback4-authentication</a></td>
      <td>Provide support for five passport based strategies</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/loopback4-authorization">loopback4-authorization</a></td>
      <td>Implement authorization using simple string based permissions</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/loopback-component-crud">loopback-component-crud</a></td>
      <td>Generic CRUD controller mixin, supports authentication, nested authorization(cascade)</td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/loopback-component-authorization">loopback-component-authorization</a></td>
      <td>Implement HRBAC authorization</td>
    </tr>
  </tbody>
<table>
