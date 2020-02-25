// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/openapi-spec-builder
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * A package to simplify creating OpenAPI specification documents in your tests
 * using the builder pattern.
 *
 * @remarks
 * Creating a full OpenAPI spec document in automated tests is rather
 * cumbersome, long JSON-like objects pollute the test test code and make it
 * difficult for readers to distinguish between what's important in the test and
 * what's just shared OpenAPI boilerplate.
 *
 * OpenApiSpecBuilder utilizes
 * {@link http://www.natpryce.com/articles/000714.html | Test Data Builder pattern}
 * to provide a TypeScript/JavaScript API allowing users to create full OpenAPI
 * Specification 3 documents in few lines of code.
 *
 * @packageDocumentation
 */

export * from './openapi-spec-builder';
