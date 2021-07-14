# Feature: Module exporting

- In order to use the LoopBack.next module
- As an app developer
- I want to import the module
- So that I can use LoopBack.next framework in my project

## Scenario: JavaScript project using Node.js's require syntax

- Given a Node.js project
- And LoopBack.next installed as a project dependency
- When I import LoopBack.next's Application construct via Node.js's require
  syntax
- Then I get an instantiable Application object

```js
const Application = require('@loopback/core').Application;
const app = new Application();
```
