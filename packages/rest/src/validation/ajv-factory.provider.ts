// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  filterByTag,
  inject,
  injectable,
  Provider,
} from '@loopback/core';
import AjvCtor from 'ajv';
import debugModule from 'debug';
import {RestBindings, RestTags} from '../keys';
import {AjvFactory, AjvFormat, AjvKeyword, ValidationOptions} from '../types';
import {openapiFormats} from './openapi-formats';

const debug = debugModule('loopback:rest:ajv');

const ajvKeywords = require('ajv-keywords');
const ajvErrors = require('ajv-errors');

export const DEFAULT_AJV_VALIDATION_OPTIONS: ValidationOptions = {
  $data: true,
  ajvKeywords: true,
  ajvErrors: true,
};

/**
 * A provider class that instantiate an AJV instance
 */
@injectable({scope: BindingScope.SINGLETON})
export class AjvFactoryProvider implements Provider<AjvFactory> {
  constructor(
    @inject(
      RestBindings.REQUEST_BODY_PARSER_OPTIONS.deepProperty('validation'),
      {optional: true},
    )
    private options: ValidationOptions = DEFAULT_AJV_VALIDATION_OPTIONS,
  ) {}

  @inject(filterByTag(RestTags.AJV_KEYWORD))
  private keywords: AjvKeyword[];

  @inject(filterByTag(RestTags.AJV_FORMAT))
  private formats: AjvFormat[];

  value(): AjvFactory {
    return options => {
      let validationOptions: ValidationOptions = {
        ...this.options,
        ...options,
      };
      // See https://github.com/epoberezkin/ajv#options
      validationOptions = {
        allErrors: true,
        jsonPointers: true,
        // nullable: support keyword "nullable" from Open API 3 specification.
        nullable: true,
        ...validationOptions,
      };

      debug('AJV options', validationOptions);
      const ajvInst = new AjvCtor(validationOptions);

      if (validationOptions.ajvKeywords === true) {
        ajvKeywords(ajvInst);
      } else if (Array.isArray(validationOptions.ajvKeywords)) {
        ajvKeywords(ajvInst, validationOptions.ajvKeywords);
      }

      if (validationOptions.ajvErrors === true) {
        ajvErrors(ajvInst);
      } else if (validationOptions.ajvErrors?.constructor === Object) {
        ajvErrors(ajvInst, validationOptions.ajvErrors);
      }

      if (this.keywords) {
        this.keywords.forEach(keyword => {
          debug('Adding Ajv keyword %s', keyword.name);
          ajvInst.addKeyword(keyword.name, keyword);
        });
      }

      for (const format of openapiFormats) {
        ajvInst.addFormat(format.name, format);
      }

      if (this.formats) {
        this.formats.forEach(format => {
          debug('Adding Ajv format %s', format.name);
          ajvInst.addFormat(format.name, format);
        });
      }

      return ajvInst;
    };
  }
}
