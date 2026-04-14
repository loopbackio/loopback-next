import {param} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import {mcpTool} from '../../decorators';

const MCP_ACCESS_PERMISSION = 'mcp.access';
export class ProjectSummaryController {
  constructor() {}

  @authorize({
    permissions: [MCP_ACCESS_PERMISSION],
  })
  @mcpTool({
    name: 'summary_get_add',
    description: 'Adds two numbers',
  })
  async add(
    @param.query.number('a') a: number,
    @param.query.number('b') b: number,
  ): Promise<{content: Array<{type: string; text: string}>}> {
    const sum = a + b;
    return {
      content: [
        {
          type: 'text',
          text: `The sum of ${a} and ${b} is ${sum}`,
        },
      ],
    };
  }

  @authorize({permissions: [MCP_ACCESS_PERMISSION]})
  @mcpTool({
    name: 'summary_add_with_prehook',
    description: 'Add with prehook',
    preHook: {
      binding: 'hooks.doubleArgs',
    },
  })
  addWithPreHook(
    @param.query.number('a') a: number,
    @param.query.number('b') b: number,
  ) {
    return {sum: a + b};
  }

  @authorize({permissions: [MCP_ACCESS_PERMISSION]})
  @mcpTool({
    name: 'summary_add_with_posthook',
    description: 'Add with posthook',
    postHook: {
      binding: 'hooks.overrideResult',
    },
  })
  addWithPostHook(
    @param.query.number('a') a: number,
    @param.query.number('b') b: number,
  ) {
    return {sum: a + b};
  }
}
