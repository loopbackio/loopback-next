// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {GraphQLServer} from '../..';
import {RecipeResolver} from './controllers/recipe-resolver';

export async function main(
  options: {port?: number; host?: string} = {port: 4000},
) {
  const server = new GraphQLServer(options);
  server.resolver(RecipeResolver);
  await server.start();
  return server;
}

if (require.main === module) {
  main().then(() => {
    console.log(`Server ready at http://localhost:4000/graphql`);
  });
}
