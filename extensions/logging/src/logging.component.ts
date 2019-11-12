// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  Binding,
  Component,
  ContextTags,
  extensionFor,
  ProviderMap,
} from '@loopback/core';
import {FluentSenderProvider, FluentTransportProvider} from './fluent';
import {LoggingBindings} from './keys';
import {WinstonLoggerProvider, WINSTON_TRANSPORT} from './winston';

/**
 * A component providing logging facilities
 */
@bind({tags: {[ContextTags.KEY]: LoggingBindings.COMPONENT}})
export class LoggingComponent implements Component {
  providers: ProviderMap;
  bindings: Binding<unknown>[];

  constructor() {
    this.providers = {
      [LoggingBindings.FLUENT_SENDER.key]: FluentSenderProvider,
      [LoggingBindings.WINSTON_LOGGER.key]: WinstonLoggerProvider,
    };

    this.bindings = [
      Binding.bind(LoggingBindings.WINSTON_TRANSPORT_FLUENT)
        .toProvider(FluentTransportProvider)
        .apply(extensionFor(WINSTON_TRANSPORT)),
    ];
  }
}
