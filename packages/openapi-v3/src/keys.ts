// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataAccessor} from '@loopback/core';
import {ControllerSpec, RestEndpoint} from './controller-spec';
import {
  ParameterObject,
  RequestBodyObject,
  ResponseDecoratorMetadata,
} from './types';

export namespace OAI3Keys {
  /**
   * Metadata key used to set or retrieve `@operation` metadata.
   */
  export const METHODS_KEY = MetadataAccessor.create<
    Partial<RestEndpoint>,
    MethodDecorator
  >('openapi-v3:methods');

  /**
   * Metadata key used to set or retrieve `@deprecated` metadata on a method.
   */
  export const DEPRECATED_METHOD_KEY = MetadataAccessor.create<
    boolean,
    MethodDecorator
  >('openapi-v3:methods:deprecated');

  /**
   * Metadata key used to set or retrieve `@deprecated` metadata on a class
   */
  export const DEPRECATED_CLASS_KEY = MetadataAccessor.create<
    boolean,
    ClassDecorator
  >('openapi-v3:class:deprecated');

  /**
   * Metadata key used to set or retrieve `@visibility` metadata on a method.
   */
  export const VISIBILITY_METHOD_KEY = MetadataAccessor.create<
    boolean,
    MethodDecorator
  >('openapi-v3:methods:visibility');

  /**
   * Metadata key used to set or retrieve `@visibility` metadata on a class
   */
  export const VISIBILITY_CLASS_KEY = MetadataAccessor.create<
    boolean,
    ClassDecorator
  >('openapi-v3:class:visibility');

  /*
   * Metadata key used to add to or retrieve an endpoint's responses
   */
  export const RESPONSE_METHOD_KEY = MetadataAccessor.create<
    ResponseDecoratorMetadata,
    MethodDecorator
  >('openapi-v3:methods:response');

  /**
   * Metadata key used to set or retrieve `param` decorator metadata
   */
  export const PARAMETERS_KEY = MetadataAccessor.create<
    ParameterObject,
    ParameterDecorator
  >('openapi-v3:parameters');

  /**
   * Metadata key used to set or retrieve `@deprecated` metadata on a method.
   */
  export const TAGS_METHOD_KEY = MetadataAccessor.create<
    string[],
    MethodDecorator
  >('openapi-v3:methods:tags');

  /**
   * Metadata key used to set or retrieve `@deprecated` metadata on a class
   */
  export const TAGS_CLASS_KEY = MetadataAccessor.create<
    string[],
    ClassDecorator
  >('openapi-v3:class:tags');

  /**
   * Metadata key used to set or retrieve `@api` metadata
   */
  export const CLASS_KEY = MetadataAccessor.create<
    ControllerSpec,
    ClassDecorator
  >('openapi-v3:class');

  /**
   * Metadata key used to set or retrieve a controller spec
   */
  export const CONTROLLER_SPEC_KEY = MetadataAccessor.create<
    ControllerSpec,
    ClassDecorator
  >('openapi-v3:controller-spec');

  /**
   * Metadata key used to set or retrieve `@requestBody` metadata
   */
  export const REQUEST_BODY_KEY = MetadataAccessor.create<
    RequestBodyObject,
    ParameterDecorator
  >('openapi-v3:request-body');
}
