# The LoopBack 4 Filter Specification - Draft 1

## Abstract

This document describes the LoopBack 4 Filter Specification; A JSON-based
[[RFC7159](https://tools.ietf.org/html/rfc7159)] data query language that
enables rich, interopable and protocol-agnostic data query filters across
multiple datastores.

## Status of This Document

This is a draft document.

## Copyright Notice

Copyright (c) 2021 The LoopBack 4 Filter Specification Authors.

## Table of Contents

- 1 [Introduction](#1-introduction)

  - 1.1 [Notational Conventions](#11-notational-conventions)
  - 1.2 [Terminology](#12-terminology)
  - 1.3 [Motivation, Prior Work and Scope](#13-motivation-prior-work-and-scope)

- 2 [Property Identifier](#2-property-identifier)

- 3 [Filter Syntax](#3-filter-syntax)

  - 3.1 [Fields Sub-Filter](#31-fields-sub-filter)
  - 3.2 [Order Sub-Filter](#32-order-sub-filter)

## 1 Introduction

### 1.1 Notational Conventions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be
interpreted as described in [[RFC2119](https://tools.ietf.org/html/rfc2119)].

The grammatical rules in this document are to be interpreted as described in
[[RFC5234](https://tools.ietf.org/html/rfc5234)].

This document makes reference to grammatical rules defined in
[[RFC7159](https://tools.ietf.org/html/rfc7159)].

### 1.2 Terminology

This specification defines the following terms:

- _Compliance Matrix_: A standardised, grouped list of Filter Features used to
  provide a higher-level overlay to gauge general interopability of features
  without requiring deep knowledge on the subject matter.
- _Connector_: A code implementation that interfaces with a Datastore that MUST
  accept a Normalized Filter for data querying against the Datastore.
- _Datastore_: A code implementation that manages the state of Connectors.
- [_Filter_](#3-filter-syntax): A JSON object that contains well-defiend
  properties to define the data query scope.
- _Feature Matrix_: A standardised list of Filter Features used gauge
  interopability of certain features.
- _Filter Feature_: A well-defined section of the Filter that can be
  implemented.
- _Normalized Filter_: A Filter subset that MUST NOT include syntactic sugar
  variants of existing syntax that do not introduce additional logical
  operations.
- _Operation_: A logical action performed by a Filter implementation (such as a
  Connector) during interpretation of a Filter instance.

### 1.3 Motivation, Prior Work and Scope

Many backend developers encounter situations where their program needs to
interface with a Repository such as a database (SQL or NoSQL), or an API over
the network. Furthermore, a developer may need to interface with relations
between data, akin to SQL relations, whether the data is managed by the same
Connector or are across different Connectors.

The current Datastore landscape has led to fragmentation on the supported data
query langauge, and has led to developers needing to utilise disparate libraries
to integrate their program with multiple, different Datastores. This reduces
knowledge transfer as developers have to learn the nuances on the query language
of different Datastores, even those that are based off a common standard like
SQL. Furthermore, most libraries do not provide first-class support for the
developers' programming language and only provide primitive interfaces such as
raw query execution, thereby preventing developers from leveraging their
benefits from being schema-aware, such as a programming language's type-safety
features during compile-time.

The LoopBack framework has attempted to solve this problem by introducing a
JSON-based Filter syntax to provide a standardised interface to define the data
query scope. However, the lack of a formalized specification and compliance
testing suite made it difficult for connectors to keep pace with the evolution
of the Filter's syntax, improper documentation of certains features leading to
incompatible implementations, and consequently, degraded developer experiences
arising from inconsistent behavior. Furthermore, the feature parity gap with
other query langauges such as SQL—such as performing joins beyond left
joins—made it difficult to adapt the Filter for more complex use-cases.

This specification will formalise the LoopBack Filter syntax and conformance
testing suite to assist Connector maintainers and users of those Connectors to
have confidence in the feature parity, interopability, and protocol-agnostic
properties of the LoopBack 4 Filter Specification itself and implementations of
the specification. Hence, the motivation of this specification is to:

1. Provide an interopable Filter query language
2. Enable consistent behavior across Connectors
3. Establish a reasonably-feature complete Filter syntax
4. Establish a standardised Feature Matrix
5. Establish a standardised Compliance Matrix
6. Formalize a testing suite for each Feature

This specification scope is limited to defining the Filter and Normalized Filter
syntax and the expected general behavior. The following are out of scope:

1. Interface or functions to be implemented by Filter Consumers
2. Filtering of non-tabular data (i.e. data stored in key-value datastores)

## 2 Property Identifier

Sub-Filters MAY utilise Property Identifiers to reference the property of a Data
Model, such as the table column name in an relational database.

A Property Identifier SHOULD only contain alphanumeric characters, and
supporting additional characters are OPTIONAL for Filter Consumers.

A Property Identifier MUST be treated as case-sensitive by Filter Producers.
Filter Consumers MAY treat a Property Identifier as case-insensitive.

The identifier MUST be sensitive to trailing spaces at either ends of the
identifier. Filter Consumers MUST reject trailing spaces if not permitted.

## 3 Filter Syntax

The Filter is broken down into multiple Sub-Filters. These Sub-Filters MUST be
identified by and encapsulated within well-defined top-level properties of the
Filter. The Filter supports the following top-level properties:

- fields
- order
- skip
- limit
- include
- where

All Sub-Filters defined in this specification are OPTIONAL. Sub-Filters are only
mandated to meet the requirements for passing the test suite for the Feature
Matrix or Compliance Matrix. It is the implementations' responsibility to decide
which parts of the Feature Matrix or Compliance Matrix, and inherently
Sub-Filters, to support.

All Filter top-level properties' value that are _undefined_ or _null_ must be
equivilant to the Sub-Filter not being applied. This means there MUST NOT be any
operations performed by that Sub-Filter.

All Sub-Filters defined in this specification MUST NOT be extended outside of
this specification unless indicated otherwise.

### 3.1 Fields Sub-Filter

The Fields Sub-Filter (herein _Sub-Filter_) indicates the properties that the
Datastore SHOULD return. Non-string values for representing properties MUST
result in a failed operation.

In this section, the following Data Model will be used for examples:

```
Users (table)
L ID
L Name
L Gender
L Address
```

The Sub-Filter MUST be an array of string, or an object of key-value pairs where
the key is the target property and the value is a boolean where _true_ indicates
that the property SHOULD be returned while _false_ indicates that the property
MUST NOT be returned. These properties MUST result in an identical operation:

```json
["Name", "Gender"]
```

```json
{
  "Name": true,
  "Gender": true
}
```

If this Sub-Filter is _undefined_, _null_, a empty array, or an empty object,
all properties of the Data Model MUST be returned.

If the Sub-Filter contains properties that do not exist in the Datastore, the
return value for that property MUST be _undefined_. There MUST NOT be a
difference in operation than if the Sub-Filter were to not contain the
non-existent property.

These Sub-Filter instances MUST result in an identical, successful operation:

```json
["Name"]
```

```json
["Name", "Phone Number"]
```

If the Sub-Filter instance contains duplicate properties, there MUST NOT be a
difference in operation than if the Sub-Filter were to not contain the duplicate
property.

These Sub-Filter instances MUST result in an identical, successful operation:

```json
["Name", "Name"]
```

```json
["Name"]
```

A Filter Consumer MAY impose additional restrictions to the Sub-Filter
instances. If a Sub-Filter instance contains properties that do not comform to
additional restrictions imposed by the Filter consumer, the operation MUST fail.

### 3.2 Order Sub-Filter

The Order Sub-Filter (herein _Sub-Filter_) defines how the return data is to be
sorted. It is either a single string (single-order) or an array of strings
(multi-order).

Array elements of the multi-order syntax are instances of the single-order
syntax. When a the data needs to be sorted against one property, either the
single-order or multi-order syntax may be used interchangably. These Sub-Filter
instances MUST result in an identical operation:

```json
"ID DESC"
```

```json
["ID DESC"]
```

If the multi-order syntax is used and multiple array elements are found, the
elements' position MUST be intepreted sequentially.

If additional whitespace (excluding the mandatory single whitespace, if any) is
found between the Property Identifier and the order direction keyword, the
additional whitespace MUST be taken as part of the Property Identifer. These
Sub-Filter instances MUST be interpreted as Property Identifier `ID . . ` (note:
2 dots representing 2 trailing whitespaces) and order direction `ASC`:

```json
"ID  "
```

```json
"ID   ASC"
```

The Order Sub-Filter syntaxes MUST adhere to the following grammatical rule:

```abnf
single-order = 1*char wsp [ "ASC" / "DESC" ] ; Order direction defaults to…
                                             ; "ASC" if a value is not provided

multi-order  = begin-array [
                   single-order-filter
                   *( value-separator single-order-filter )
               ] end-array

order        = single-order / multi-order
```

### 3.3 Include Sub-Filter

The Include Sub-Filter (herein _Sub-Filter_) defines what relational data should
be returned. It is an array of strings (simplified syntax) and/or objects
(expanded syntax), of which their order MUST NOT carry any semantic meaning.

The Sub-Filter MUST reference a case-sensitive _Relation Identifier_ in
accordance to the syntax used. Any trailing whitespace before or after the
Relation Identifier MUST be treated as part of the Relation Identifer itself.
Hence, these Relation Identifiers MUST be treated differently:

```
"MyRelationIdentifier"
```

```
" MyRelationIdentifier"
```

```
"  MyRelationIdentifier"
```

```
" MyRelationIdentifier  "
```

Relation Identifier SHOULD NOT be handled by the database engine that is acting
as a Final Filter Consumer. Instead, the Relation Identifier SHOULD BE handled
by an Intermediary Filter Consumer that manages the database schema.

A Filter Consumer MAY reject a Relation Identifier if it contains prohibited
characters such as tailing spaces.
