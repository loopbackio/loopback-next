// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {GraphQLComponent} from '../../graphql.component';
import {GraphQLBindings} from '../../keys';

describe('GraphQL component', () => {
  it('binds server and booter bindings;', () => {
    const app = new Application();
    app.component(GraphQLComponent);
    expect(app.isBound(GraphQLBindings.COMPONENT)).to.be.true();
    expect(app.isBound('booters.GraphQLResolverBooter')).to.be.true();
  });
});
