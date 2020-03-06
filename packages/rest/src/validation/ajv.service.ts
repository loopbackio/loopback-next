// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, Provider} from '@loopback/core';
import AJVCtor, {Ajv} from 'ajv';
import debugModule from 'debug';
import {RestBindings} from '../keys';
import {RequestBodyValidationOptions} from '../types';
const debug = debugModule('loopback:rest:ajv');

const ajvKeywords = require('ajv-keywords');
const ajvErrors = require('ajv-errors');

/**
 * A provider class that instantiate an AJV instance
 */
export class AjvProvider implements Provider<Ajv> {
  constructor(
    @inject(
      RestBindings.REQUEST_BODY_PARSER_OPTIONS.deepProperty('validation'),
      {optional: true},
    )
    private options: RequestBodyValidationOptions = {},
  ) {}

  value() {
    let options = this.options;
    // See https://github.com/epoberezkin/ajv#options
    options = {
      allErrors: true,
      jsonPointers: true,
      // nullable: support keyword "nullable" from Open API 3 specification.
      nullable: true,
      // Allow OpenAPI spec binary format
      unknownFormats: ['binary'],
      ...options,
    };

    debug('AJV options', options);
    const ajv = new AJVCtor(options);

    if (options.ajvKeywords === true) {
      ajvKeywords(ajv);
    } else if (Array.isArray(options.ajvKeywords)) {
      ajvKeywords(ajv, options.ajvKeywords);
    }

    if (options.ajvErrors === true) {
      ajvErrors(ajv);
    } else if (options.ajvErrors?.constructor === Object) {
      ajvErrors(ajv, options.ajvErrors);
    }
    return ajv;
  }
}
