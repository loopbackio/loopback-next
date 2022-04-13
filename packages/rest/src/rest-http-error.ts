// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import HttpErrors from 'http-errors';

export namespace RestHttpErrors {
  export function invalidData<T, Props extends object = {}>(
    data: T,
    name: string,
    extraProperties?: Props,
  ): HttpErrors.HttpError & Props {
    const msg = `Invalid data ${JSON.stringify(data)} for parameter "${name}".`;
    return Object.assign(
      new HttpErrors.BadRequest(msg),
      {
        code: 'INVALID_PARAMETER_VALUE',
        parameterName: name,
      },
      extraProperties,
    );
  }

  export function unsupportedMediaType(
    contentType: string,
    allowedTypes: string[] = [],
  ) {
    const msg = allowedTypes?.length
      ? `Content-type ${contentType} does not match [${allowedTypes}].`
      : `Content-type ${contentType} is not supported.`;
    return Object.assign(new HttpErrors.UnsupportedMediaType(msg), {
      code: 'UNSUPPORTED_MEDIA_TYPE',
      contentType: contentType,
      allowedMediaTypes: allowedTypes,
    });
  }

  export function missingRequired(name: string): HttpErrors.HttpError {
    const msg = `Required parameter ${name} is missing!`;
    return Object.assign(new HttpErrors.BadRequest(msg), {
      code: 'MISSING_REQUIRED_PARAMETER',
      parameterName: name,
    });
  }

  export function invalidParamLocation(location: string): HttpErrors.HttpError {
    const msg = `Parameters with "in: ${location}" are not supported yet.`;
    return new HttpErrors.NotImplemented(msg);
  }

  export const INVALID_REQUEST_BODY_MESSAGE =
    'The request body is invalid. See error object `details` property for more info.';

  export function invalidRequestBody(
    details: ValidationErrorDetails[],
  ): HttpErrors.HttpError & {details: ValidationErrorDetails[]} {
    return Object.assign(
      new HttpErrors.UnprocessableEntity(INVALID_REQUEST_BODY_MESSAGE),
      {
        code: 'VALIDATION_FAILED',
        details,
      },
    );
  }

  /**
   * An invalid request body error contains a `details` property as the machine-readable error.
   * Each entry in `error.details` contains 4 attributes: `path`, `code`, `info` and `message`.
   * `ValidationErrorDetails` defines the type of each entry, which is an object.
   * The type of `error.details` is `ValidationErrorDetails[]`.
   */
  export interface ValidationErrorDetails {
    /**
     * A path to the invalid field.
     */
    path: string;
    /**
     * A single word code represents the error's type.
     */
    code: string;
    /**
     * A human readable description of the error.
     */
    message: string;
    /**
     * Some additional details that the 3 attributes above don't cover.
     */
    info: object;
  }
}
