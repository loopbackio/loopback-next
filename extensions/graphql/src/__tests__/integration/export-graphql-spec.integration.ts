// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {expect, TestSandbox} from '@loopback/testlab';
import fs from 'fs';
import path from 'path';
import {format} from 'util';
import {GraphQLBindings, GraphQLComponent, GraphQLServer} from '../..';
import {RecipeResolver} from '../fixtures/graphql-resolvers/recipe/recipe.resolver';

const sandbox = new TestSandbox(path.resolve(__dirname, '../../../.sandbox'));

const EXPECTED_SPEC = `schema {
  query: Query
  mutation: Mutation
}

type Mutation {
  addRecipe(recipe: RecipeInput!): Recipe!
}

type Query {
  recipes: [Recipe!]!
}

"""Object representing cooking recipe"""
type Recipe {
  id: ID!
  lowercaseTitle: String! @lowercase
  title: String!
}

input RecipeInput {
  description: String
  ingredients: [String!]!
  title: String!
}
`;

describe('exportGraphQLSchema', () => {
  describe('standalone GraphQLServer', () => {
    let server: GraphQLServer;
    let lastLog: string;

    const log = (formatter: unknown, ...args: unknown[]) => {
      lastLog = format(formatter, ...args);
    };

    beforeEach(async () => {
      givenServer();
      server.resolver(RecipeResolver);
    });
    function givenServer() {
      server = new GraphQLServer();
    }
    it('renders the expected spec to stdout', async () => {
      await server.exportGraphQLSchema('-', log);
      expect(lastLog).to.eql(EXPECTED_SPEC);
    });
    it('renders the expected spec to file', async () => {
      const file = path.join(sandbox.path, 'standalone.spec.gql');
      await server.exportGraphQLSchema(file);
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).to.eql(EXPECTED_SPEC);
    });
  });

  describe('Booted RestApplication with GraphQL as middleware', () => {
    let app: TestApplication;
    let lastLog: string;

    const log = (formatter: unknown, ...args: unknown[]) => {
      lastLog = format(formatter, ...args);
    };
    beforeEach(async () => {
      await givenApp();
    });

    it('renders to stdout', async () => {
      await app.exportGQLFile();
      expect(lastLog).to.eql(EXPECTED_SPEC);
    });

    it('renders the expected spec to file', async () => {
      const file = path.join(sandbox.path, 'standalone.spec.gql');
      await app.exportGQLFile(file);
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).to.eql(EXPECTED_SPEC);
    });

    async function givenApp() {
      app = new TestApplication();
      await app.boot();
    }

    class TestApplication extends BootMixin(RestApplication) {
      constructor(options: ApplicationConfig = {}) {
        super(options);
        this.component(GraphQLComponent);
        this.configure(GraphQLBindings.GRAPHQL_SERVER).to({
          asMiddlewareOnly: true,
        });
        const server = this.getSync(GraphQLBindings.GRAPHQL_SERVER);
        this.expressMiddleware('middleware.express.GraphQL', server.expressApp);
        this.projectRoot = path.join(__dirname, '../fixtures');
        this.bootOptions = {
          graphqlResolvers: {
            dirs: ['graphql-resolvers'],
            extensions: ['.resolver.js'],
            nested: true,
          },
        };
      }

      async exportGQLFile(exportPath = '') {
        const server = await this.get(GraphQLBindings.GRAPHQL_SERVER);
        await server.exportGraphQLSchema(exportPath, log);
      }
    }
  });
});
