import {bind} from '@loopback/core';
import {OperationObject} from 'openapi3-ts';
import {OpenApiSpec} from '../../types';
import {asSpecEnhancer, OASEnhancer} from '../types';

/**
 * A spec enhancer to add verbose deprecation status to OperationObjects
 *
 */
@bind(asSpecEnhancer)
export class DeprecateSpecEnhancer implements OASEnhancer {
  name = 'deprecate';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    try {
      return this.defaultDeprecate(spec);
    } catch {
      console.log('Default Deprecate Enhancer failed, returned original spec.');
      return spec;
    }
  }

  /**
   *  add verbose deprecation status to OperationObjects if not set
   *
   */
  private defaultDeprecate(spec: OpenApiSpec): OpenApiSpec {
    Object.keys(spec.paths).forEach(path =>
      Object.keys(spec.paths[path]).forEach(op => {
        const OpObj = spec.paths[path][op] as OperationObject;
        if (!OpObj.deprecated) OpObj.deprecated = false;
      }),
    );

    return spec;
  }
}
