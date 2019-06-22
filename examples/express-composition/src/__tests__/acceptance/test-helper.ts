// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-express-composition
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {givenHttpServerConfig, Client, supertest} from '@loopback/testlab';
import {NoteApplication} from '../../application';
import {ExpressServer} from '../../server';
import {Note} from '../../models/note.model';

export async function setupExpressApplication(): Promise<AppWithClient> {
  const server = new ExpressServer({rest: givenHttpServerConfig()});
  await server.boot();
  await server.start();

  const lbApp = server.lbApp;

  const client = supertest('http://127.0.0.1:3000');

  return {server, client, lbApp};
}

export interface AppWithClient {
  server: ExpressServer;
  client: Client;
  lbApp: NoteApplication;
}

/**
 * Generate a complete Note object for use with tests.
 * @param  A partial (or complete) Note object.
 */
export function givenNote(note?: Partial<Note>) {
  const data = Object.assign(
    {
      title: 'start essay',
      content: 'write thesis',
    },
    note,
  );
  return new Note(data);
}
