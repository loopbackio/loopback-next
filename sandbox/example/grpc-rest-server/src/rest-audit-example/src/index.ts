import {ApplicationConfig, RestAuditExampleApplication} from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new RestAuditExampleApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

