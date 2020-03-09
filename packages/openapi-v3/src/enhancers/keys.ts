import {BindingKey} from '@loopback/core';
import {OASEnhancerService} from './spec-enhancer.service';

export namespace OASEnhancerBindings {
  /**
   * Strongly-typed binding key for SpecService
   */
  export const OAS_ENHANCER_SERVICE = BindingKey.create<OASEnhancerService>(
    'services.SpecService',
  );

  /**
   * Name/id of the OAS enhancer extension point
   */
  export const OAS_ENHANCER_EXTENSION_POINT_NAME = 'oas-enhancer';
}
