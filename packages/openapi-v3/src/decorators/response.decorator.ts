// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {MethodMultiDecoratorFactory} from '@loopback/core';
import * as httpStatus from 'http-status';
import {ExampleObject} from 'openapi3-ts';
import {OAI3Keys} from '../keys';
import {ResponseModelOrSpec} from '../types';

export interface ResponseOptions {
  contentType?: string;
  description?: string;
  examples?: ExampleObject;
}
export function response(
  responseCode: number,
  responseModelOrSpec: ResponseModelOrSpec,
  options?: ResponseOptions,
) {
  const coercedCode = String(responseCode) as keyof httpStatus.HttpStatus;
  const messageKey = `${coercedCode}_MESSAGE` as keyof httpStatus.HttpStatus;

  if (Array.isArray(responseModelOrSpec)) {
    return MethodMultiDecoratorFactory.createDecorator(
      OAI3Keys.RESPONSE_METHOD_KEY,
      responseModelOrSpec.map(m => ({
        responseCode,
        responseModelOrSpec: m,
        contentType: options?.contentType ?? 'application/json',
        description: options?.description ?? (httpStatus[messageKey] as string),
      })),
      {decoratorName: '@response', allowInheritance: false},
    );
  } else {
    return MethodMultiDecoratorFactory.createDecorator(
      OAI3Keys.RESPONSE_METHOD_KEY,
      [
        {
          responseCode,
          responseModelOrSpec,
          contentType: options?.contentType ?? 'application/json',
          description:
            options?.description ?? (httpStatus[messageKey] as string),
        },
      ],
      {decoratorName: '@response', allowInheritance: false},
    );
  }
}
