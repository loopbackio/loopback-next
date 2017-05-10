# Feature: Initializing the application

- In order to initialize my application
- As an app developer
- I want to register components and sequences when initalizing the application
- So that I can use them throughout the application lifecycle

## Scenario: Basic usage (config provided)

- Given an importable `Application` class
- When I create an application with user-defined configurations
- Then the application should register the given components and sequences

```ts
import {Application} from '@loopback/core';
import {Authentication} from '@loopback/authentication';
import {Authorization} from '@loopback/authorization';
import {Rejection} from '@loopback/rejection';

const app = new Application({
  components: [Todo, Authentication, Authorization, Rejection],
  sequence: [TodoSequence]
});

// get metadata about the registered components
console.log(app.find('component.*')); // [Bindings] should match the 4 components registered above
console.log(app.find('sequence.*')); // [Bindings] should match the 1 sequence registered above
```
