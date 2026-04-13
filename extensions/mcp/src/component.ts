import {Application, Component, CoreBindings, inject} from '@loopback/core';
import {
  McpSchemaGeneratorService,
  McpServerFactory,
  McpToolRegistry,
} from './services';
import {McpController} from './controllers';
import {McpToolRegistryBootObserver} from './observers';

export class McpComponent implements Component {
  services = [McpSchemaGeneratorService, McpServerFactory, McpToolRegistry];
  controllers = [McpController];
  lifeCycleObservers = [McpToolRegistryBootObserver];
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
  ) {}
}
