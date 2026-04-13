import {expect} from '@loopback/testlab';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import * as jwt from 'jsonwebtoken';
import {McpHookContext} from '../../interfaces';
import {McpSchemaGeneratorService} from '../../services';
import {McpToolRegistry} from '../../services/mcp-tool-registry.service';
import {isTextMessage} from '../../types';
import {TestingApplication} from '../fixtures/application';

const MCP_ACCESS_PERMISSION = 'mcp.access';
const UNEXPECTED_MESSAGE_FORMAT = 'Unexpected message format';

async function generateToken(permissions: string[]): Promise<string> {
  return jwt.sign(
    {
      id: 'test-user',
      permissions,
    },
    process.env.JWT_SECRET ?? 'test-secret',
    {
      issuer: process.env.JWT_ISSUER,
      algorithm: 'HS256',
    },
  );
}

describe('MCP Tool – add (acceptance)', () => {
  let app: TestingApplication;
  let restServerUrl: string;

  before(async () => {
    app = new TestingApplication();
    app.bind('hooks.doubleArgs').to(async ({args}: McpHookContext) => ({
      args: {
        a: (args.a as number) * 2,
        b: (args.b as number) * 2,
      },
    }));

    app.bind('hooks.overrideResult').to(async () => ({
      result: {
        content: [{type: 'text', text: 'OVERRIDDEN'}],
      },
    }));
    app.service(McpSchemaGeneratorService);

    await app.boot();
    await app.start();

    const registry = await app.get<McpToolRegistry>('services.McpToolRegistry');
    await registry.initialize();

    restServerUrl = app.restServer.url ?? '';
  });

  after(async () => {
    await app.stop();
  });

  async function createClient(token: string) {
    const transport = new StreamableHTTPClientTransport(
      new URL(`${restServerUrl}/mcp`),
      {
        requestInit: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );

    const client = new Client({
      name: 'test-client',
      version: '1.0.0',
    });

    await client.connect(transport);
    return client;
  }

  it('invokes add tool and returns correct sum', async () => {
    const token = await generateToken([MCP_ACCESS_PERMISSION]);
    const client = await createClient(token);

    const result = await client.callTool({
      name: 'summary_get_add',
      arguments: {a: 10, b: 20},
    });
    if (isTextMessage(result)) {
      expect(result.content[0].text).to.equal('The sum of 10 and 20 is 30');
    } else {
      throw new Error(UNEXPECTED_MESSAGE_FORMAT);
    }

    await client.close();
  });

  it('denies execution for unauthorized user', async () => {
    const token = await generateToken([]);
    const client = await createClient(token);

    const result = await client.callTool({
      name: 'summary_get_add',
      arguments: {a: 1, b: 2},
    });
    if (isTextMessage(result)) {
      expect(result.isError).to.be.true();
      expect(result.content[0].text).to.containEql(
        'Access denied for MCP tool',
      );
    } else {
      throw new Error(UNEXPECTED_MESSAGE_FORMAT);
    }

    await client.close();
  });

  it('denies execution when permission is different', async () => {
    const token = await generateToken(['some.other.permission']);
    const client = await createClient(token);

    const result = await client.callTool({
      name: 'summary_get_add',
      arguments: {a: 1, b: 2},
    });

    if (isTextMessage(result)) {
      expect(result.isError).to.be.true();
      expect(result.content[0].text).to.containEql(
        'Access denied for MCP tool',
      );
    } else {
      throw new Error(UNEXPECTED_MESSAGE_FORMAT);
    }

    await client.close();
  });

  it('executes pre-hook and modifies arguments', async () => {
    const token = await generateToken([MCP_ACCESS_PERMISSION]);
    const client = await createClient(token);

    const result = await client.callTool({
      name: 'summary_add_with_prehook',
      arguments: {a: 2, b: 3},
    });
    if (isTextMessage(result)) {
      const response = JSON.parse(result.content[0].text);
      expect(response.sum).to.equal(10);
    } else {
      throw new Error(UNEXPECTED_MESSAGE_FORMAT);
    }

    await client.close();
  });

  it('executes post-hook and overrides result', async () => {
    const token = await generateToken([MCP_ACCESS_PERMISSION]);
    const client = await createClient(token);

    const result = await client.callTool({
      name: 'summary_add_with_posthook',
      arguments: {a: 1, b: 1},
    });

    if (isTextMessage(result)) {
      expect(result.content[0].text).to.equal('OVERRIDDEN');
    } else {
      throw new Error(UNEXPECTED_MESSAGE_FORMAT);
    }

    await client.close();
  });
});
