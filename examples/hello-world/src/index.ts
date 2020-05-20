// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/example-hello-world
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig, HelloWorldApplication} from './application';

export async function main(config: ApplicationConfig) {
  const app = new HelloWorldApplication();
  await app.start();
  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST ?? 'localhost',
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
