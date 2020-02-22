// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * The `@loopback/tsdocs` package is an internal module to generate
 * {@link https://github.com/Microsoft/tsdoc | tsdoc} based API docs
 * for `@loopback/*` packages within
 * {@link https://github.com/strongloop/loopback-next | loopback-next} monorepo
 * managed by {@link https://github.com/lerna/lerna | Lerna}.
 *
 * @remarks
 * It's built on top of {@link https://api-extractor.com | Microsoft API Extractor}:
 *
 * - {@link https://github.com/Microsoft/web-build-tools/tree/master/apps/api-extractor | api-extractor}
 * - {@link https://github.com/Microsoft/web-build-tools/tree/master/apps/api-documenter | api-documenter}
 *
 * @packageDocumentation
 */
export * from './helper';
export * from './monorepo-api-extractor';
export * from './update-api-md-docs';
