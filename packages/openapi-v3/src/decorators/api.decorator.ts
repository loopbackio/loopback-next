// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ClassDecoratorFactory} from '@loopback/context';
import {ControllerSpec} from '../controller-spec';
import {OAI3Keys} from '../keys';

/**
 * Decorate the given Controller constructor with metadata describing
 * the HTTP/REST API the Controller implements/provides.
 *
 * `@api` can be applied to controller classes.
 *
 * @example
 *
 * ```ts
 * @api({basePath: '/my'})
 * class MyController {
 *   // ...
 * }
 * ```
 *
 * @param spec - OpenAPI specification describing the endpoints
 * handled by this controller
 *
 */
export function api(spec: ControllerSpec) {
  return ClassDecoratorFactory.createDecorator<ControllerSpec>(
    OAI3Keys.CLASS_KEY,
    spec,
    {decoratorName: '@api'},
  );
}
