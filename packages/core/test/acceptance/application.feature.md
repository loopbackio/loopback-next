# Feature: Initializing the application

- In order to initialize my application
- As an app developer
- I want to register components when initalizing the application
- So that I can use them throughout the application lifecycle

## Scenario: Basic usage (config provided)

- Given an importable `Application` class
- When I create an application with user-defined configurations
- Then the application should register the given components

```ts
import {Application} from '@loopback/core';
import {Authentication} from '@loopback/authentication';
import {Authorization} from '@loopback/authorization';
import {Rejection} from '@loopback/rejection';

const app = new Application();
app.component(Todo);
app.component(Authentication);
app.component(Authorization);
app.component(Rejection);
```
