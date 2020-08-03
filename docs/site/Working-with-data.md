---
lang: en
title: 'Working with data'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Working-with-data.html
---

In LoopBack 4, models describe the shape of data, repositories provide behavior
like CRUD operations, and controllers define routes (this is different from
LoopBack 3.x where models implement behavior too). LB4
[repositories](Repositories.md) provide a couple of create, read, update, and
delete (CRUD) operations. Once you have defined these three artifacts, you can
add data to the model, manipulate the data, and query it through these CRUD
operations. The following is an overview of CRUD operations at different levels:

<table>
  <thead>
    <tr>
      <th width="120">Operation</th>
      <th width="360"><a href="https://loopback.io/doc/en/lb4/Routes.html">REST</a></th>
      <th width="300">LoopBack model method<br>(Node.js API)&#42;</th>
      <th width="120">Corresponding SQL<br>Operation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Create</td>
      <td>
        PUT /<em>modelName</em>
        <br/>POST /<em>modelName</em>
      </td>
      <td><code><a href="https://loopback.io/doc/en/lb4/apidocs.repository.defaultcrudrepository.create.html" class="external-link" rel="nofollow">create()</a></code>
      <br/><code><a href="https://loopback.io/doc/en/lb4/apidocs.repository.defaultcrudrepository.createall.html" class="external-link" rel="nofollow">createAll()</a></code>
      </td>
      <td>INSERT</td>
    </tr>
    <tr>
      <td>Read (Retrieve)</td>
      <td>GET /<em>modelName</em>?filter=...</td>
      <td><code><a href="https://loopback.io/doc/en/lb4/apidocs.repository.defaultcrudrepository.find.html" class="external-link" rel="nofollow">find<sup>&#42;</sup>()</a></code>
      </td>
      <td>SELECT</td>
    </tr>
    <tr>
      <td>Update (Modify)</td>
      <td>
        POST /<em>modelName</em>
        <br/>PUT /<em>modelName</em>
      </td>
      <td><code><a href="https://loopback.io/doc/en/lb4/apidocs.repository.defaultcrudrepository.update.html" class="external-link" rel="nofollow">update<sup>&#42;</sup>()</a></code>
      <br/><code><a href="https://loopback.io/doc/en/lb4/apidocs.repository.defaultcrudrepository.replacebyid.html" class="external-link" rel="nofollow">replaceById()</a></code>
      </td>
      <td>UPDATE</td>
    </tr>
    <tr>
      <td>Delete (Destroy)</td>
      <td>DELETE /<em>modelName</em>/<em>modelID</em></td>
      <td><code><a href="https://loopback.io/doc/en/lb4/apidocs.repository.defaultcrudrepository.delete.html" class="external-link" rel="nofollow">delete<sup>&#42;</sup>()</a></code>
      </td>
      <td>DELETE</td>
    </tr>
  </tbody>
</table>

(\*) Methods listed are just prominent examples; other methods may provide
similar functionality; for example: `findById()`, `findOne()`,
and `updateAll()`.  See
[DefaultCrudRepository Methods API documentation](https://loopback.io/doc/en/lb4/apidocs.repository.defaultcrudrepository.html#methods)
for more information.

See the following articles for more information:

- [Querying data](Querying-data.html)
  - [Fields filter](Fields-filter.html)
  - [Include filter](Include-filter.html)
  - [Limit filter](Limit-filter.html)
  - [Order filter](Order-filter.html)
  - [Skip filter](Skip-filter.html)
  - [Where filter](Where-filter.html)
- [Using database transactions](Using-database-transactions.html)
- [Executing database commands](Executing-database-commands.md)
