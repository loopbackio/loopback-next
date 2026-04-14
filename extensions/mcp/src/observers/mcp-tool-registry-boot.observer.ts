import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  service,
} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {McpToolRegistry} from '../services';

/**
 * Lifecycle observer to initialize MCP tool registry after application boot
 */
@lifeCycleObserver('mcpToolRegistryInit')
export class McpToolRegistryBootObserver implements LifeCycleObserver {
  constructor(
    @service(McpToolRegistry)
    private readonly mcpToolRegistry: McpToolRegistry,
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
  ) {}

  /**
   * Initialize MCP tool registry after application starts
   */
  async start(): Promise<void> {
    try {
      await this.mcpToolRegistry.initialize();
    } catch (error) {
      this.logger.error('Failed to initialize MCP tool registry:', error);
      throw error;
    }
  }

  /**
   * Called when application stops
   */
  async stop(): Promise<void> {
    this.logger.info('MCP tool registry stopping...');
  }
}
