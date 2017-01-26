import { Application, AppConfig } from 'loopback';
import { Client } from './client';

export function createApp(config?: AppConfig) : Application {
  return new Application(config);
}

export function createClient(app : Application) {
  return new Client(app);
}