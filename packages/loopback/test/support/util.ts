import { Application, AppConfig } from 'loopback';
import { Client } from './client';
import sampleApp = require('./fixtures/notes-app');
import { NoteController } from 'loopback/test/support/fixtures/notes-app/note';

export function createApp(config?: AppConfig) : Application {
  return new Application(config);
}

export function createClient(app : Application) {
  return new Client(app);
}

export function createController(controllerName: string) {
  return new NoteController();
}

export function getSampleApp() : Application {
  // TODO silence the output for tests
  return sampleApp;
}