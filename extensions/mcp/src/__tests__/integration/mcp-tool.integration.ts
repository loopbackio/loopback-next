import {Context} from '@loopback/core';
import {expect, sinon} from '@loopback/testlab';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {McpServerFactory} from '../../services/mcp-server-factory.service';
import {McpToolRegistry} from '../../services/mcp-tool-registry.service';

describe('McpServerFactory (integration)', () => {
  let ctx: Context;
  let toolRegistry: McpToolRegistry;
  let factory: McpServerFactory;

  const mockTools = [
    {
      name: 'testTool',
      description: 'Test tool',
      schema: {type: 'object', properties: {}},
      handler: sinon.stub(),
    },
  ];

  beforeEach(() => {
    ctx = new Context();

    // stub registry
    toolRegistry = {
      getToolDefinitions: sinon.stub().returns(mockTools),
    } as unknown as McpToolRegistry;

    factory = new McpServerFactory(ctx, toolRegistry);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('registers tools on MCP server', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolSpy = sinon.spy(McpServer.prototype as any, 'registerTool');

    const server = factory.createServer();
    expect(server).to.be.instanceOf(McpServer);

    sinon.assert.calledOnce(toolSpy);
    sinon.assert.calledWithMatch(
      toolSpy,
      mockTools[0].name,
      {
        description: mockTools[0].description,
        inputSchema: mockTools[0].schema,
      },
      sinon.match.func,
    );
  });
});
