import {bind} from '@loopback/core';
import {OperationObject} from 'openapi3-ts';
import {OpenApiSpec} from '../../types';
import {asSpecEnhancer, OASEnhancer} from '../types';

/**
 * A spec enhancer to combine OperationObject Tags OpenApiSpec into spec.tags
 *
 */
@bind(asSpecEnhancer)
export class TagsSpecEnhancer implements OASEnhancer {
  name = 'tags';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    try {
      return this.tagsConsolidate(spec);
    } catch {
      console.log('Tags Enhancer failed, returned original spec.');
      return spec;
    }
  }

  /**
   *  Combine OperationObject Tags OpenApiSpec into spec.tags
   *
   */
  private tagsConsolidate(spec: OpenApiSpec): OpenApiSpec {
    Object.keys(spec.paths).forEach(path =>
      Object.keys(spec.paths[path]).forEach(op => {
        const OpObj = spec.paths[path][op] as OperationObject;
        if (OpObj.tags) this.patchTags(OpObj.tags, spec);
      }),
    );

    return spec;
  }

  // TODO(dougal83) desc. resolution
  private patchTags(tags: Array<string>, spec: OpenApiSpec) {
    if (!spec.tags) {
      spec.tags = [];
    }
    tags.forEach(name => {
      if (spec.tags!.findIndex(tag => tag.name === name) <= 0)
        spec.tags!.push({name, description: ''});
    });
  }
}
