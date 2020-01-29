import {bind} from '@loopback/core';
import {OpenApiSpec} from '../../types';
import {asSpecEnhancer, OASEnhancer} from '../types';

/**
 * A spec enhancer to restructure the OpenAPI spec in an opinionated manner.
 * (dougal83)
 *
 */
@bind(asSpecEnhancer)
export class StructureSpecEnhancer implements OASEnhancer {
  name = 'structure';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    try {
      return this.restructureSpec(spec);
    } catch {
      console.log('Restructure Enhancer failed, returned original spec.');
      return spec;
    }
  }

  /**
   *  Structure OpenApiSpec in an opinionated manner
   *
   */
  private restructureSpec(spec: OpenApiSpec): OpenApiSpec {
    spec = Object.assign(
      {
        openapi: undefined,
        info: undefined,
        servers: undefined,
        paths: undefined,
        components: undefined,
        tags: undefined,
      },
      spec,
    );

    Object.keys(spec.paths).forEach(path =>
      Object.keys(spec.paths[path]).forEach(op => {
        spec.paths[path][op] = Object.assign(
          {
            tags: undefined,
            summary: undefined,
            description: undefined,
            operationId: undefined,
            parameters: undefined,
            responses: undefined,
            depreciated: undefined,
          },
          spec.paths[path][op],
        );
      }),
    );

    return spec;
  }
}
