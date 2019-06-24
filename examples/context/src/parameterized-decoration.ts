// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  BindingAddress,
  BindingTag,
  Constructor,
  Context,
  createBindingFromClass,
  inject,
} from '@loopback/context';

/**
 * Interface for `Greeter`
 */
interface Greeter {
  hello(): string;
}

/**
 * A function to create a new class with parameterized decorations
 * @param bindingKeyForName Binding key for current user
 * @param tags Additional binding tags
 */
function createClassWithDecoration(
  bindingKeyForName: BindingAddress<string>,
  ...tags: BindingTag[]
): Constructor<Greeter> {
  @bind({tags})
  class GreeterTemplate implements Greeter {
    constructor(@inject(bindingKeyForName) private userName: string) {}

    hello() {
      return `Hello, ${this.userName}`;
    }
  }
  return GreeterTemplate;
}

export async function main() {
  const ctx = new Context();

  ctx.bind('name1').to('John');
  ctx.bind('name2').to('Jane');

  const class1 = createClassWithDecoration('name1', {tags: {prefix: '1'}});
  const binding1 = createBindingFromClass(class1, {key: 'greeter1'});
  ctx.add(binding1);
  console.log('1:', binding1.tagMap);

  const class2 = createClassWithDecoration('name2', {tags: {prefix: '2'}});
  const binding2 = createBindingFromClass(class2, {key: 'greeter2'});
  ctx.add(binding2);
  console.log('2:', binding2.tagMap);

  const greeting1 = await ctx.get<Greeter>('greeter1');
  console.log('1: %s', greeting1.hello());

  const greeting2 = await ctx.get<Greeter>('greeter2');
  console.log('2: %s', greeting2.hello());
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
