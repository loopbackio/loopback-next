// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/booter-lb3app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin, BootOptions} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import * as path from 'path';
import {Lb3AppBooterComponent} from '../lb3app.booter.component';
const lb3app = require('../../fixtures/lb3app/server/server');

export class CoffeeApplication extends BootMixin(
  RepositoryMixin(RestApplication),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.projectRoot = path.resolve(__dirname + '/..');
  }
}

export async function setupApplication(
  booterOptions?: BootOptions,
): Promise<AppWithClient> {
  const app = new CoffeeApplication({rest: givenHttpServerConfig()});

  app.component(Lb3AppBooterComponent);

  app.bootOptions = Object.assign({}, booterOptions);

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: CoffeeApplication;
  client: Client;
}

/**
 * Generate a complete Coffee object for use with tests.
 */
export function givenCoffeeShop() {
  const CoffeeShop = lb3app.models.CoffeeShop;

  const data = {
    name: 'great coffee shop',
    city: 'Toronto',
  };

  return new CoffeeShop(data);
}

/**
 * Generate a complete User object for use with tests.
 */
export async function givenUser() {
  const User = lb3app.models.User;

  return User.create({
    email: 'sample@email.com',
    password: 'L00pBack!',
  });
}
