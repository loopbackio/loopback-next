// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
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
import ajvErrors from 'ajv-errors';
import ajvFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';
import debugModule from 'debug';
import {RestBindings, RestTags} from '../keys';
import {AjvFactory, AjvFormat, AjvKeyword, ValidationOptions} from '../types';
import {openapiFormats} from './openapi-formats';

const debug = debugModule('loopback:rest:ajv');

export const DEFAULT_AJV_VALIDATION_OPTIONS: ValidationOptions = {
  $data: true,
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
        strictTypes: false,
        ...validationOptions,
      };

      debug('AJV options', validationOptions);
      const ajvOptions = {...validationOptions};
      delete ajvOptions.ajvErrors;
      const ajvInst = new AjvCtor(ajvOptions);
      ajvInst.addKeyword('components');
      ajvInst.addKeyword('x-typescript-type');
      ajvInst.addKeyword('x-index-info');
      ajvInst.addKeyword({
        keyword: 'x-default',
        schemaType: [
          'string',
          'number',
          'integer',
          'boolean',
          'null',
          'object',
          'array',
        ],
      });
      ajvInst.addKeyword({keyword: 'x-defaultFn', schemaType: ['string']});
      ajvInst.addKeyword({
        keyword: 'x-index',
        schemaType: ['boolean', 'object'],
      });
      ajvInst.addKeyword({keyword: 'x-length', schemaType: ['number']});
      ajvInst.addKeyword({keyword: 'x-precision', schemaType: ['number']});
      ajvInst.addKeyword({keyword: 'x-scale', schemaType: ['number']});
      ajvInst.addKeyword({keyword: 'x-generated', schemaType: 'boolean'});
      ajvInst.addKeyword({keyword: 'x-hidden', schemaType: ['boolean']});

      ajvKeywords(ajvInst, validationOptions.ajvKeywords);

      ajvErrors(ajvInst, validationOptions.ajvErrors);

      if (this.keywords) {
        this.keywords.forEach(keyword => {
          debug('Adding Ajv keyword %s', keyword.keyword);
          ajvInst.addKeyword(keyword);
        });
      }

      ajvFormats(ajvInst);
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
