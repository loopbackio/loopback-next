---
lang: en
title: 'Authorization Component - Decision Matrix'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Authorization
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Authorization-component-decision-matrix.html
---

The final decision to allow access for a subject is done by the interceptor by
creating a decision matrix from the voting results (from all the `authorizer`
and `voter` functions of an endpoint).

The following table illustrates an example decision matrix with 3 votes and
corresponding options.

| Authorizer | Voter # 1 | Voter #2 | Options                  | Final Decision |
| ---------- | --------- | -------- | ------------------------ | -------------- |
| Deny       | Deny      | Deny     | **any**                  | Deny           |
| Allow      | Allow     | Allow    | **any**                  | Allow          |
| Abstain    | Allow     | Abstain  | **any**                  | Allow          |
| Abstain    | Deny      | Abstain  | **any**                  | Deny           |
| Deny       | Allow     | Abstain  | {precedence: Deny}       | Deny           |
| Deny       | Allow     | Abstain  | {precedence: Allow}      | Allow          |
| Allow      | Abstain   | Deny     | {precedence: Deny}       | Deny           |
| Allow      | Abstain   | Deny     | {precedence: Allow}      | Allow          |
| Abstain    | Abstain   | Abstain  | {defaultDecision: Deny}  | Deny           |
| Abstain    | Abstain   | Abstain  | {defaultDecision: Allow} | Allow          |

- Here, if suppose there is an `authorizer` function and 2 voters for an
  endpoint.
  - if the `authorizer` function returns `ALLOW`, but voter 1 in authorize
    decorator returns `ABSTAIN` and voter 2 in decorator returns `DENY`.
  - In this case, if the options provided while
    [registering the authorization component](#authorization-component),
    provides precedence as `DENY`, then the access for the subject is denied to
    the endpoint.
