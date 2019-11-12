// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, config, Getter, inject, Provider} from '@loopback/core';
import {createFluentSender, FluentSender, Options} from 'fluent-logger';
import {LoggingBindings} from './keys';
const fluent = require('fluent-logger');
import TransportStream = require('winston-transport');

/**
 * Provider for FluentSender
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class FluentSenderProvider implements Provider<FluentSender<any>> {
  constructor(
    @config.getter() private getFluentConfig: Getter<Options | undefined>,
  ) {}

  @inject.binding()
  private binding: Binding<unknown>;

  async value() {
    const options = await this.getFluentConfig();
    if (options == null) {
      throw new Error(
        `Fluent is not configured. Please configure ${this.binding.key}.`,
      );
    }
    return createFluentSender('LoopBack', options);
  }
}

/**
 * Provider to create FluentTransport for Winston
 */
export class FluentTransportProvider implements Provider<TransportStream> {
  constructor(
    @config.getter({fromBinding: LoggingBindings.FLUENT_SENDER})
    private getFluentConfig: Getter<Options | undefined>,
  ) {}

  @inject.binding()
  private binding: Binding<unknown>;

  async value() {
    const options = await this.getFluentConfig();
    if (options == null) {
      throw new Error(
        `Fluent is not configured. Please configure ${this.binding.key}.`,
      );
    }
    const cls = fluent.support.winstonTransport();
    return new cls('LoopBack', options);
  }
}
