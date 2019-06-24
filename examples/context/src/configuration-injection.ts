// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config, Context} from '@loopback/context';

/**
 * Configuration for greeters
 */
type GreeterConfig = {
  prefix?: string;
  includeDate?: boolean;
};

/**
 * A greeter service
 */
class Greeter {
  constructor(
    /**
     * Inject configuration for this bound instance
     */
    @config() private settings: GreeterConfig = {},
  ) {}

  greet(name: string) {
    const prefix = this.settings.prefix ? `${this.settings.prefix}` : '';
    const date = this.settings.includeDate
      ? `[${new Date().toISOString()}]`
      : '';
    return `${date} ${prefix}: Hello, ${name}`;
  }
}

export async function main() {
  const ctx = new Context();

  // Configure `greeter` with `{prefix: '>>>', includeDate: true}`
  ctx
    .configure<GreeterConfig>('greeter')
    .to({prefix: '>>>', includeDate: true});
  ctx.bind('greeter').toClass(Greeter);

  const greeter = await ctx.get<Greeter>('greeter');
  console.log(greeter.greet('Ray'));
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
