---
lang: en
title: 'Decorators'
keywords: LoopBack 4.0, LoopBack-Next
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Decorators.html
---

A decorator allows you to annotate or modify your class declarations and members
with metadata.

## Introduction

_If you're new to Decorators in TypeScript, see
[here](https://www.typescriptlang.org/docs/handbook/decorators.html) for more
info._

Decorators give LoopBack the flexibility to modify your plain TypeScript classes
and properties in a way that allows the framework to better understand how to
make use of them, without the need to inherit base classes or add functions that
tie into an API.

As a default, LoopBack comes with some pre-defined decorators:

- [OpenAPI Decorators](decorators/Decorators_openapi.md)
- [Dependency Injection Decorator](decorators/Decorators_inject.md)
- [Authentication Decorator](decorators/Decorators_authenticate.md)
- [Repository Decorators](decorators/Decorators_repository.md)
