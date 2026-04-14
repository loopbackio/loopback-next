import {inject, service} from '@loopback/core';
import {post, Request, Response, RestBindings} from '@loopback/rest';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {CONTENT_TYPE, ILogger, LOGGER, STATUS_CODE} from '@sourceloop/core';
import {authenticate, STRATEGY} from 'loopback4-authentication';
import {authorize} from 'loopback4-authorization';
import {McpServerFactory} from '../services';

export class McpController {
  constructor(
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
    @service(McpServerFactory)
    private readonly serverFactory: McpServerFactory,
  ) {}

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: ['*'],
  })
  @post('/mcp', {
    summary: 'MCP HTTP Message',
    description: 'Handle MCP message via StreamableHTTP transport',
    requestBody: {
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: {
            type: 'object',
            description: 'MCP message payload',
          },
        },
      },
    },
    responses: {
      [STATUS_CODE.OK]: {
        description: 'MCP message processed successfully',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {
              type: 'object',
              description: 'MCP response message',
            },
          },
        },
      },
      [STATUS_CODE.INTERNAL_SERVER_ERROR]: {
        description: 'Internal server error',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {
              type: 'object',
              properties: {
                jsonrpc: {type: 'string'},
                error: {
                  type: 'object',
                  properties: {
                    code: {type: 'number'},
                    message: {type: 'string'},
                  },
                },
                id: {type: 'null'},
              },
            },
          },
        },
      },
    },
  })
  async handleMCPRequest(
    @inject(RestBindings.Http.REQUEST) req: Request,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<void> {
    try {
      // Server creation using factory service
      const server = this.serverFactory.createServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      // Set up cleanup handlers
      /* eslint-disable @typescript-eslint/no-misused-promises */
      res.on('close', async () => {
        await transport.close();
        await server.close();
        this.logger.info('Session closed.');
      });

      res.on('error', async () => {
        await transport.close();
        await server.close();
        this.logger.info('Closing Session as it errorred out.');
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      this.logger.error('Failed to establish MCP connection:', err);
      if (!res.headersSent) {
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  }
}
