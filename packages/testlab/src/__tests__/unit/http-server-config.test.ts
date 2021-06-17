// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '../../expect';
import {givenHttpServerConfig, HttpOptions} from '../../http-server-config';

describe('givenHttpServerConfig', () => {
  it('sets port to 0 by default', () => {
    const config = givenHttpServerConfig();
    expect(config.port).to.equal(0);
  });

  it('sets host to "127.0.0.1" by default', () => {
    const config = givenHttpServerConfig();
    expect(config.host).to.equal('127.0.0.1');
  });

  it('honors custom port', () => {
    const config = givenHttpServerConfig({port: 3000});
    expect(config.port).to.equal(3000);
  });

  it('honors custom host', () => {
    const config = givenHttpServerConfig({host: '::1'});
    expect(config.host).to.equal('::1');
  });

  it('ignores custom port set to undefined', () => {
    // The type parameter <HttpOptions> is needed to avoid
    // `error TS2339: Property 'port' does not exist on type 'never'.` reported
    // by TypeScript 3.9.x. Otherwise, the inferred type of first argument
    // is `{port: undefined}`.
    const config = givenHttpServerConfig<HttpOptions>({port: undefined});
    expect(config.port).to.equal(0);
  });

  it('ignores custom host set to undefined', () => {
    // The type parameter <HttpOptions> is needed to avoid
    // `error TS2339: Property 'host' does not exist on type 'never'.` reported
    // by TypeScript 3.9.x. Otherwise, the inferred type of first argument
    // is `{host: undefined}`.
    const config = givenHttpServerConfig<HttpOptions>({host: undefined});
    expect(config.host).to.equal('127.0.0.1');
  });
});
