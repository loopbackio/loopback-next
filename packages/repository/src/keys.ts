// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Binding tags for repository related bindings
 */
export namespace RepositoryTags {
  /**
   * Tag for model class bindings
   */
  export const MODEL = 'model';
  /**
   * Tag for repository bindings
   */
  export const REPOSITORY = 'repository';
  /**
   * Tag for datasource bindings
   */
  export const DATASOURCE = 'datasource';
}

/**
 * Binding keys and namespaces for repository related bindings
 */
export namespace RepositoryBindings {
  /**
   * Namespace for model class bindings
   */
  export const MODELS = 'models';
  /**
   * Namespace for repository bindings
   */
  export const REPOSITORIES = 'repositories';
  /**
   * Namespace for datasource bindings
   */
  export const DATASOURCES = 'datasources';
}
