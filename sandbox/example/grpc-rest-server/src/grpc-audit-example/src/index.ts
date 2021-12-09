import {ApplicationConfig, GrpcTestApplication} from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new GrpcTestApplication(options);
  await app.boot();
  await app.start();

  console.log(`Server is running...`);

  return app;
}

