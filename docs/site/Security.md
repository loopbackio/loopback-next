---
lang: en
title: 'Security'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Security.html
---

Security is a common layer shared by any LoopBack4 authentication and
authorization modules. It defines the contract of all the identities,
credentials, permissions needed in a LoopBack 4 authentication/authorization
system.

`Principle` is the base interface that describes a user/application/device's
identity. A principle has a unique id as symbol `securityId`. For example, now
`@loopback/authentication` decodes the user id from a request, assigns it as a
user profile's `securityId` and passes the user profile to
`@loopback/authorization` as the LoopBack 4 application's current user.

## To Be Done

_The types/interfaces in this section are still in build._

`Permission` defines an action/access against a protected resource. It's the
`what` for security. In a permission based authorization system, a method is
mapped to a permission that has action type, resource type, resource property,
etc...

There are three levels of permissions

- Resource level (e.g. Order, User)
- Instance level (e.g. Order-0001, User-1001)
- Property level (e.g. User-0001.email)

`Credential` is a bunch of security attributes used to authenticate the subject.
Such credentials include passwords, Kerberos tickets, and public key
certificates.

`Subject` is the "who" for security, it consists of a set of `Principles`,
`Credentials` and `Permissions`.
