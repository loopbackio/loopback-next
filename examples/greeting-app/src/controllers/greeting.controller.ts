// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeting-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {
  GreetingService,
  GREETING_SERVICE,
} from '@loopback/example-greeter-extension';
import {get, param, Request, RestBindings} from '@loopback/rest';
import {Message} from '../types';

/* istanbul ignore file */
export class GreetingController {
  constructor(
    @inject(GREETING_SERVICE) private greetingService: GreetingService,
    @inject(RestBindings.Http.REQUEST) private request: Request,
  ) {}

  @get('/greet/{name}', {
    responses: {
      '200': {
        description: '',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                timestamp: 'string',
                language: 'string',
                message: 'string',
              },
            },
          },
        },
      },
    },
  })
  async greet(@param.path.string('name') name: string): Promise<Message> {
    const language: string =
      this.request.acceptsLanguages(['en', 'zh']) || 'en';
    const greeting = await this.greetingService.greet(language, name);
    return {
      timestamp: new Date(),
      language,
      greeting,
    };
  }
}
