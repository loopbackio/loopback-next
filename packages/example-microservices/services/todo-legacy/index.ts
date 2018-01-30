import { Application } from '@loopback/core';
import { TodoApplication } from './application';


async function main(): Promise<void> {
  const app = new TodoApplication();
  await app.start();
  console.log('Application Info:', await app.info());
}

main().catch(err => {
  console.log('Cannot start the app.', err);
  process.exit(1);
});
