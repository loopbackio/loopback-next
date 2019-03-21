// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ArtifactOptions,
  BaseArtifactBooter,
  BootBindings,
  booter,
} from '@loopback/boot';
import {
  Application,
  config,
  Constructor,
  CoreBindings,
  inject,
} from '@loopback/core';
import debugFactory from 'debug';
import {ResolverClassMetadata} from 'type-graphql/dist/metadata/definitions';
import {getMetadataStorage} from 'type-graphql/dist/metadata/getMetadataStorage';
import {registerResolver} from '../graphql.server';

const debug = debugFactory('loopback:graphql:resolver-booter');

type GraphQLResolverClass = Constructor<object>;

/**
 * A class that extends BaseArtifactBooter to boot the 'GraphQLResolver' artifact type.
 *
 * Supported phases: configure, discover, load
 *
 * @param app - Application instance
 * @param projectRoot - Root of User Project relative to which all paths are resolved
 * @param bootConfig - GraphQLResolver Artifact Options Object
 */
@booter('graphqlResolvers')
export class GraphQLResolverBooter extends BaseArtifactBooter {
  resolvers: GraphQLResolverClass[];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: Application,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config()
    public interceptorConfig: ArtifactOptions = {},
  ) {
    super(
      projectRoot,
      // Set GraphQLResolver Booter Options if passed in via bootConfig
      Object.assign({}, GraphQLResolverDefaults, interceptorConfig),
    );
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each file by
   * creating a DataSourceConstructor and binding it to the application class.
   */
  async load() {
    await super.load();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolverClasses: ResolverClassMetadata[] = (getMetadataStorage() as any)
      .resolverClasses;
    this.resolvers = this.classes.filter(cls => {
      return resolverClasses.some(r => !r.isAbstract && r.target === cls);
    });
    for (const resolver of this.resolvers) {
      debug('Bind interceptor: %s', resolver.name);
      const binding = registerResolver(this.app, resolver);
      debug('Binding created for interceptor: %j', binding);
    }
  }
}

/**
 * Default ArtifactOptions for GraphQLResolverBooter.
 */
export const GraphQLResolverDefaults: ArtifactOptions = {
  dirs: ['graphql-resolvers'],
  extensions: ['.js'],
  nested: true,
};
