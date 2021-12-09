/* eslint-disable @typescript-eslint/no-inferrable-types */
import {main as grpcMain} from './grpc-index';
import {main as restMain} from './rest-index';

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Server Type (gRPC/REST) ?', (serverType: string) => {
  if(serverType === 'gRPC') {
    const config = {
        grpc: {},
      };
      grpcMain(config).catch(err => {
        console.error('Cannot start the application.', err);
        process.exit(1);
      });
}

else{
    const config = {
        rest: {
          port: +(process.env.PORT ?? 3000),
          host: process.env.HOST,
          // The `gracePeriodForClose` provides a graceful close for http/https
          // servers with keep-alive clients. The default value is `Infinity`
          // (don't force-close). If you want to immediately destroy all sockets
          // upon stop, set its value to `0`.
          // See https://www.npmjs.com/package/stoppable
          gracePeriodForClose: 5000, // 5 seconds
          openApiSpec: {
            // useful when used with OpenAPI-to-GraphQL to locate your application
            setServersFromRequest: true,
          },
        },
      };
      restMain(config).catch(err => {
        console.error('Cannot start the application.', err);
        process.exit(1);
      });
}
  readline.close();
});


