// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/booter-lb3app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Boot a LoopBack 3 application and expose its REST API via LoopBack 4.
 *
 * @remarks
 * This package provides a way for LoopBack 3 developers to boot their LoopBack
 * 3 application, convert the application's Swagger spec into OpenAPI v3, and
 * then mount the application, including its spec, onto a target LoopBack 4
 * application.
 *
 * @pakageDocumentation
 */

export * from './lb3app.booter.component';
