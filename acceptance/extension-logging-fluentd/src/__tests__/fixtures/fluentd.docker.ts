// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/test-extension-logging-fluentd
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as path from 'path';
import {GenericContainer, StartedTestContainer} from 'testcontainers';

export const ROOT_DIR = path.join(__dirname, '../../../fixtures');
export const ETC_DIR = path.join(ROOT_DIR, 'etc');

async function startFluentd() {
  if (process.env.FLUENTD_SERVICE_HOST != null) return;
  const container = await new GenericContainer('fluent/fluentd')
    .withName('fluentd_lb4')
    .withExposedPorts(24224, 9880)
    .withEnv('FLUENTD_CONF', 'fluentd.conf')
    .withBindMount(ETC_DIR, '/fluentd/etc', 'ro')
    .start();
  process.env.FLUENTD_SERVICE_HOST = container.getHost();
  process.env.FLUENTD_SERVICE_PORT_TCP = container
    .getMappedPort(24224)
    .toString();
  process.env.FLUENTD_SERVICE_PORT_HTTP = container
    .getMappedPort(9880)
    .toString();
  return container;
}

let fluentd: StartedTestContainer | undefined;

/**
 * Root-level before hook to start Fluentd container
 */
before(async function (this: Mocha.Context) {
  // Do not run with non-linux CI
  if (process.env.CI && process.platform !== 'linux') return;
  this.timeout(30 * 1000);
  fluentd = await startFluentd();
  expect(process.env.FLUENTD_SERVICE_PORT_HTTP).to.be.String();
  expect(process.env.FLUENTD_SERVICE_PORT_TCP).to.be.String();
});

/**
 * Root-level before hook to stop Fluentd container
 */
after(async function (this: Mocha.Context) {
  this.timeout(30 * 1000);
  if (fluentd) await fluentd.stop();
});

export async function readLog() {
  if (fluentd == null) return '';
  const result = await fluentd.exec([
    '/bin/sh',
    '-c',
    'cat /fluentd/log/*.log',
  ]);
  return result.output;
}
