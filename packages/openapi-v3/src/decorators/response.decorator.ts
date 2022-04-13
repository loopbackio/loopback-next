// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MethodMultiDecoratorFactory} from '@loopback/core';
import httpStatus from 'http-status';
import {
  ContentObject,
  ReferenceObject,
  ResponseObject,
  SchemaObject,
} from 'openapi3-ts';
import {OAI3Keys} from '../keys';
import {ResponseDecoratorMetadata, ResponseModelOrSpec} from '../types';

// overloading the definition because content cannot be undefined in this case.
interface ResponseWithContent extends ResponseObject {
  content: ContentObject;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isResponseObject(c: any): c is ResponseWithContent {
  return (
    c != null &&
    Object.prototype.hasOwnProperty.call(c, 'content') &&
    c.content != null
  );
}

function buildDecoratorReducer(
  responseCode: number,
  description: string,
  contentType = 'application/json',
) {
  const decoratorItemReducer = (
    r: ResponseDecoratorMetadata,
    m: ResponseModelOrSpec,
  ) => {
    // allow { content: { 'application/json': {...}}}
    if (isResponseObject(m)) {
      Object.keys(m.content ?? {}).forEach(ct => {
        r.push({
          responseCode,
          responseModelOrSpec: m.content[ct].schema as
            | SchemaObject
            | ReferenceObject,
          contentType: ct,
          description: m.description ?? description,
        });
      });
    } else {
      r.push({
        responseCode,
        responseModelOrSpec: m,
        // we're defaulting these for convenience for now.
        contentType,
        description,
      });
    }
    return r;
  };
  return decoratorItemReducer;
}

/**
 * Add response object to a path spec.
 * @param responseCode - The HTTP response code.
 * @param responseModelOrSpec - The corresponding response object. Or the model
 *        type used to generate the response object.
 *
 * @example
 * ```ts
 * class MyController {
 *   @get('/greet')
 *   @oas.response(200, SuccessModel)
 *   @oas.response(404, OneError, { $ref: '#/definition...'})
 *   @oas.response(403, SecondError, { schema: ... })
 *   greet() {
 *     return new SuccessModel({message: 'Hello, world'});
 *   }
 * }
 * ```
 */
export function response(
  responseCode: number,
  ...responseModelOrSpec: ResponseModelOrSpec[]
) {
  const messageKey = String(responseCode) as keyof httpStatus.HttpStatus;

  return MethodMultiDecoratorFactory.createDecorator(
    OAI3Keys.RESPONSE_METHOD_KEY,
    responseModelOrSpec.reduce(
      buildDecoratorReducer(responseCode, httpStatus[messageKey] as string),
      [],
    ),
    {decoratorName: '@response', allowInheritance: false},
  );
}

export namespace response {
  /**
   * Decorate the response as a file
   *
   * @example
   * ```ts
   * import {oas, get, param} from '@loopback/openapi-v3';
   * import {RestBindings, Response} from '@loopback/rest';
   *
   * class MyController {
   *   @get('/files/{filename}')
   *   @oas.response.file('image/jpeg', 'image/png')
   *   download(
   *     @param.path.string('filename') fileName: string,
   *     @inject(RestBindings.Http.RESPONSE) response: Response,
   *   ) {
   *     // use response.download(...);
   *   }
   * }
   * ```
   * @param mediaTypes - A list of media types for the file response. It's
   * default to `['application/octet-stream']`.
   */
  export const file = (...mediaTypes: string[]) => {
    if (mediaTypes.length === 0) {
      mediaTypes = ['application/octet-stream'];
    }
    const responseWithContent: ResponseWithContent = {
      content: {},
      description: 'The file content',
    };
    for (const t of mediaTypes) {
      responseWithContent.content[t] = {
        schema: {
          type: 'string',
          format: 'binary', // This is required by OpenAPI spec 3.x
        },
      };
    }

    return response(200, responseWithContent);
  };
}
