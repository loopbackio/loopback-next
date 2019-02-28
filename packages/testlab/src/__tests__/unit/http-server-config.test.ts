// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {givenHttpServerConfig} from '../../http-server-config';
import {expect} from '../../expect';

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
    const config = givenHttpServerConfig({port: undefined});
    expect(config.port).to.equal(0);
  });

  it('ignores custom host set to undefined', () => {
    const config = givenHttpServerConfig({host: undefined});
    expect(config.host).to.equal('127.0.0.1');
  });
});
