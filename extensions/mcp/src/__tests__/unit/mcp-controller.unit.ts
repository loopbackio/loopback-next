import {
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {Request, Response} from '@loopback/rest';
import {McpServerFactory} from '../../services';
import {ILogger, STATUS_CODE} from '@sourceloop/core';
import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {McpController} from '../../controllers';

describe('McpController (unit)', () => {
  let controller: McpController;
  let logger: StubbedInstanceWithSinonAccessor<ILogger>;
  let serverFactory: StubbedInstanceWithSinonAccessor<McpServerFactory>;
  let mockServer: sinon.SinonStubbedInstance<Server>;
  let mockTransport: sinon.SinonStubbedInstance<StreamableHTTPServerTransport>;
  let req: Request;
  let res: sinon.SinonStubbedInstance<Response>;
  let handlers: {[key: string]: Function[]};
  const MCP_ERROR_LOG = 'Failed to establish MCP connection:';

  beforeEach(() => {
    // Mock logger

    logger = {
      info: sinon.stub(),
      error: sinon.stub(),
      warn: sinon.stub(),
      debug: sinon.stub(),
    } as unknown as StubbedInstanceWithSinonAccessor<ILogger>;

    // Mock server

    mockServer = {
      connect: sinon.stub().resolves(),
      close: sinon.stub().resolves(),
    } as unknown as sinon.SinonStubbedInstance<Server>;

    // Mock transport
    mockTransport = {
      handleRequest: sinon.stub().resolves(),
      close: sinon.stub().resolves(),
    } as unknown as sinon.SinonStubbedInstance<StreamableHTTPServerTransport>;

    // Mock server factory
    serverFactory = {
      createServer: sinon.stub().returns(mockServer),
    } as unknown as StubbedInstanceWithSinonAccessor<McpServerFactory>;

    // Mock request
    req = {
      body: {jsonrpc: '2.0', method: 'test'},
    } as Request;

    // Mock response
    res = {
      // Initialize the array to hold captured handlers
      on: sinon.stub().callsFake((event: string, handler: Function) => {
        if (!handlers[event]) {
          handlers[event] = [];
        }
        handlers[event].push(handler);
        return res;
      }),
      headersSent: false,
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    } as unknown as sinon.SinonStubbedInstance<Response>;

    handlers = {};
    // Stub StreamableHTTPServerTransport constructor

    sinon
      .stub(StreamableHTTPServerTransport.prototype, 'handleRequest')
      .callsFake(mockTransport.handleRequest);

    sinon
      .stub(StreamableHTTPServerTransport.prototype, 'close')
      .callsFake(mockTransport.close);

    controller = new McpController(logger, serverFactory);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('handleMCPRequest', () => {
    it('should handle close event and cleanup resources', async () => {
      let closeHandler: Function | undefined;

      (res.on as sinon.SinonStub).callsFake(
        (event: string, handler: Function) => {
          if (event === 'close') {
            closeHandler = handler;
          }

          return res;
        },
      );

      await controller.handleMCPRequest(req, res);

      expect(closeHandler).to.not.be.undefined();

      // Trigger close event
      if (closeHandler) {
        await closeHandler();
      }

      sinon.assert.calledOnce(mockTransport.close);
      sinon.assert.calledOnce(mockServer.close);
      sinon.assert.calledWith(
        logger.info as sinon.SinonStub,
        'Session closed.',
      );
    });

    it('should handle error event and cleanup resources', async () => {
      let errorHandler: Function | undefined;

      (res.on as sinon.SinonStub).callsFake(
        (event: string, handler: Function) => {
          if (event === 'error') {
            errorHandler = handler;
          }

          return res;
        },
      );

      await controller.handleMCPRequest(req, res);
      expect(errorHandler).to.not.be.undefined();

      // Trigger error event
      if (errorHandler) {
        await errorHandler();
      }

      sinon.assert.calledOnce(mockTransport.close);
      sinon.assert.calledOnce(mockServer.close);
      sinon.assert.calledWith(
        logger.info as sinon.SinonStub,
        'Closing Session as it errorred out.',
      );
    });

    it('should handle server creation failure and return error response', async () => {
      const error = new Error('Server creation failed');

      (serverFactory.createServer as sinon.SinonStub).throws(error);

      await controller.handleMCPRequest(req, res);

      sinon.assert.calledWith(
        logger.error as sinon.SinonStub,
        MCP_ERROR_LOG,
        error,
      );

      sinon.assert.calledWith(
        res.status as sinon.SinonStub,
        STATUS_CODE.INTERNAL_SERVER_ERROR,
      );

      sinon.assert.calledWith(res.json as sinon.SinonStub, {
        jsonrpc: '2.0',

        error: {
          code: -32603,

          message: 'Internal server error',
        },

        id: null,
      });
    });

    it('should handle server connection failure and return error response', async () => {
      const error = new Error('Connection failed');

      mockServer.connect.rejects(error);

      await controller.handleMCPRequest(req, res);

      sinon.assert.calledWith(
        logger.error as sinon.SinonStub,
        MCP_ERROR_LOG,
        error,
      );

      sinon.assert.calledWith(
        res.status as sinon.SinonStub,
        STATUS_CODE.INTERNAL_SERVER_ERROR,
      );

      sinon.assert.calledWith(res.json as sinon.SinonStub, {
        jsonrpc: '2.0',

        error: {
          code: -32603,

          message: 'Internal server error',
        },

        id: null,
      });
    });

    it('should not send error response if headers already sent', async () => {
      const error = new Error('Transport error');

      mockTransport.handleRequest.rejects(error);
      res.headersSent = true;
      await controller.handleMCPRequest(req, res);

      sinon.assert.calledWith(
        logger.error as sinon.SinonStub,
        MCP_ERROR_LOG,
        error,
      );

      sinon.assert.notCalled(res.status as sinon.SinonStub);
      sinon.assert.notCalled(res.json as sinon.SinonStub);
    });
  });
});
