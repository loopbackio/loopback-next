# Feature: Initializing the application

- In order to initialize my application
- As an app developer
- I want register components and sequences when initalizing the application
- So that I can use them throughout the application lifecycle

## Scenario: Basic usage (config provided)

- Given an importable `Application` class
- When I create an application with user-defined configurations
- Then the application should register the given components and sequences

```ts
import {Application} from '@loopback/core';

const app = new Application({
  components: [Todo, Authentication, Authorization, Rejection],
  sequence: TodoSequence
});

console.log(app.get('components.*')); // ['Todo', 'Authentication', 'Authorization', 'Rejection']
console.log(app.get('sequences.*')); // ['Sequence']
```
