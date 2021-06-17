// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {GraphQLBindings, GraphQLComponent} from '../..';

describe('GraphQL component', () => {
  it('binds server and booter bindings', () => {
    const app = new Application();
    app.component(GraphQLComponent);
    expect(app.isBound(GraphQLBindings.COMPONENT)).to.be.true();
    expect(app.isBound('booters.GraphQLResolverBooter')).to.be.true();
  });

  it('configures GraphQL server from app config', () => {
    const app = new Application({
      graphql: {
        asMiddlewareOnly: true,
      },
    });
    app.component(GraphQLComponent);
    expect(app.getConfigSync(GraphQLBindings.GRAPHQL_SERVER)).to.eql({
      asMiddlewareOnly: true,
    });
  });

  it('configures GraphQL server to override app config', () => {
    const app = new Application({
      graphql: {
        asMiddlewareOnly: true,
      },
    });
    app.component(GraphQLComponent);
    app.configure(GraphQLBindings.GRAPHQL_SERVER).to({asMiddlewareOnly: false});
    expect(app.getConfigSync(GraphQLBindings.GRAPHQL_SERVER)).to.eql({
      asMiddlewareOnly: false,
    });
  });
});
