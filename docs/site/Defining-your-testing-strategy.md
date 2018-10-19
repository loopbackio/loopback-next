---
lang: en
title: 'Defining your testing strategy'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Defining-your-testing-strategy.html
---

{% include previous.html content=" This article continues from
[Defining the API using code-first approach](./Defining-the-API-using-code-first-approach.md).
" %}

## Define your testing strategy

It may be tempting to overlook the importance of a good testing strategy when
starting a new project. Initially, as the project is small and you mostly keep
adding new code, even a badly-written test suite seems to work well. However, as
the project grows and matures, inefficiencies in the test suite can severely
slow down progress.

A good test suite has the following properties:

- **Speed**: The test suite should complete quickly. This encourages short
  red-green-refactor cycle, which makes it easier to spot problems, because
  there have been few changes made since the last test run that passed. It also
  shortens deployment times, making it easy to frequently ship small changes,
  reducing the risk of major breakages.
- **Reliability**: The test suite should be reliable. No developer enjoys
  debugging a failing test only to find out it was poorly written and failures
  are not related to any problem in the tested code. Flaky tests reduce the
  trust in your tests, up to point where you learn to ignore these failures,
  which will eventually lead to a situation when a test failed legitimately
  because of a bug in the application, but you did not notice.
- **Isolation of failures**: The test suite should make it easy to isolate the
  source of test failures. To fix a failing test, developers need to find the
  specific place that does not work as expected. When the project contains
  thousands of lines and the test failure can be caused by any part of the
  system, then finding the bug is very difficult, time consuming and
  demotivating.
- **Resilience**: The test implementation should be robust and resilient to
  changes in the tested code. As the project grows and matures, you may need to
  change existing behavior. With a brittle test suite, each change may break
  dozens of tests, for example when you have many end-to-end/UI tests that rely
  on specific UI layout. This makes change prohibitively expensive, up to a
  point where you may start questioning the value of such test suite.

References:

- [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html) by Martin
  Fowler
- [The testing pyramid](http://www.agilenutshell.com/episodes/41-testing-pyramid)
  by Jonathan Rasmusson
- [Just say no to more end-to-end tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)
- [100,000 e2e selenium tests? Sounds like a nightmare!](https://watirmelon.blog/2014/05/14/100000-e2e-selenium-tests-sounds-like-a-nightmare/)
- [Growing Object-Oriented Software Guided by Tests](http://www.growing-object-oriented-software.com/)

### How to build a great test suite

To create a great test suite, think smaller and favor fast, focused unit-tests
over slow application-wide end-to-end tests.

Say you are implementing the "search" endpoint of the Product resource described
earlier. You might write the following tests:

1.  One "acceptance test", where you start the application, make an HTTP request
    to search for a given product name, and verify that expected products were
    returned. This verifies that all parts of the application are correctly
    wired together.

2.  Few "integration tests" where you invoke `ProductController` API from
    JavaScript/TypeScript, talk to a real database, and verify that the queries
    built by the controller work as expected when executed by the database
    server.

3.  Many "unit tests" where you test `ProductController` in isolation and verify
    that the controller handles all different situations, including error paths
    and edge cases.

### Testing workflow

Here is what your testing workflow might look like:

1.  Write an acceptance test demonstrating the new feature you are going to
    build. Watch the test fail with a helpful error message. Use this new test
    as a reminder of what is the scope of your current work. When the new tests
    passes then you are done.

2.  Think about the different ways how the new feature can be used and pick one
    that's most easy to implement. Consider error scenarios and edge cases that
    you need to handle too. In the example above, where you want to search for
    products by name, you may start with the case when no product is found.

3.  Write a unit-test for this case and watch it fail with an expected (and
    helpful) error message. This is the "red" step in Test Driven Development
    ([TDD](https://en.wikipedia.org/wiki/Test-driven_development)).

4.  Write a minimal implementation need to make your tests pass. Building up on
    the example above, let your search method return an empty array. This is the
    "green" step in TDD.

5.  Review the code you have written so far, and refactor as needed to clean up
    the design. Don't forget to keep your test code clean too! This is the
    "refactor" step in TDD.

6.  Repeat the steps 2-5 until your acceptance test starts passing.

When writing new unit tests, watch out for situations where your tests are
asserting on how the tested objects interacted with the mocked dependencies,
while making implicit assumptions about what is the correct usage of the
dependencies. This may indicate that you should add an integration test in
addition to a unit test.

For example, when writing a unit test to verify that the search endpoint is
building a correct database query, you would usually assert that the controller
invoked the model repository method with an expected query. While this gives us
confidence about the way the controller is building queries, it does not tell us
whether such queries will actually work when they are executed by the database
server. An integration test is needed here.

To summarize:

- Pay attention to your test code. It's as important as the "real" code you are
  shipping to production.
- Prefer fast and focused unit tests over slow app-wide end-to-end tests.
- Watch out for integration points that are not covered by unit-tests and add
  integration tests to verify your units work well together.

See [Testing Your Application](Testing-your-application.md) for a reference
manual on automated tests.
