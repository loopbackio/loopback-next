// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  Binding,
  Component,
  config,
  ContextTags,
  extensionFor,
  ProviderMap,
} from '@loopback/core';
import {FluentSenderProvider, FluentTransportProvider} from './fluent';
import {
  HttpAccessLogInterceptor,
  InvocationLoggingInterceptor,
} from './interceptors';
import {LoggingBindings} from './keys';
import {WinstonLoggerProvider, WINSTON_TRANSPORT} from './winston';

/**
 * Configuration for LoggingComponent
 */
export type LoggingComponentConfig = {
  /**
   * A flag to enable fluent, default to `true`
   */
  enableFluent?: boolean;
  /**
   * A flag to enable Winston-based http access log, default to `true`
   */
  enableHttpAccessLog?: boolean;
};

/**
 * A component providing logging facilities
 */
@bind({tags: {[ContextTags.KEY]: LoggingBindings.COMPONENT}})
export class LoggingComponent implements Component {
  providers: ProviderMap;
  bindings: Binding<unknown>[];

  constructor(
    @config()
    loggingConfig: LoggingComponentConfig | undefined,
  ) {
    loggingConfig = {
      enableFluent: true,
      enableHttpAccessLog: true,
      ...loggingConfig,
    };
    this.providers = {
      [LoggingBindings.WINSTON_LOGGER.key]: WinstonLoggerProvider,
      [LoggingBindings.WINSTON_INVOCATION_LOGGER
        .key]: InvocationLoggingInterceptor,
    };

    if (loggingConfig.enableHttpAccessLog) {
      this.providers[
        LoggingBindings.WINSTON_HTTP_ACCESS_LOGGER.key
      ] = HttpAccessLogInterceptor;
    }

    if (loggingConfig.enableFluent) {
      this.providers[LoggingBindings.FLUENT_SENDER.key] = FluentSenderProvider;
      // Only create fluent transport if it's configured
      this.bindings = [
        Binding.bind(LoggingBindings.WINSTON_TRANSPORT_FLUENT)
          .toProvider(FluentTransportProvider)
          .apply(extensionFor(WINSTON_TRANSPORT)),
      ];
    }
  }
}
