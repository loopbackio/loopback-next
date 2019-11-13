// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as path from 'path';
import {GenericContainer, StartedTestContainer} from 'testcontainers';

export const ROOT_DIR = path.join(__dirname, '../../../fixtures');
export const ETC_DIR = path.join(ROOT_DIR, 'etc');

async function startFluentd() {
  const container = await new GenericContainer(
    'fluent/fluentd',
    'v1.7.4-debian-1.0',
  )
    .withName('fluentd_lb4')
    .withExposedPorts(24224, 9880)
    .withEnv('FLUENTD_CONF', 'fluentd.conf')
    .withBindMount(ETC_DIR, '/fluentd/etc', 'ro')
    .start();
  process.env.FLUENTD_SERVICE_HOST = container.getContainerIpAddress();
  process.env.FLUENTD_SERVICE_PORT_TCP = container
    .getMappedPort(24224)
    .toString();
  process.env.FLUENTD_SERVICE_PORT_HTTP = container
    .getMappedPort(9880)
    .toString();
  return container;
}

let fluentd: StartedTestContainer;

/* eslint-disable no-invalid-this */
/**
 * Root-level before hook to start Fluentd container
 */
before(async function() {
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
after(async function() {
  this.timeout(30 * 1000);
  if (fluentd) await fluentd.stop();
});

export async function readLog() {
  const result = await fluentd.exec([
    '/bin/sh',
    '-c',
    'cat /fluentd/log/*.log',
  ]);
  return result.output;
}
