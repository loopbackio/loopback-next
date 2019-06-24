// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  BindingFilter,
  BindingTemplate,
  Context,
  createBindingFromClass,
  filterByTag,
} from '@loopback/context';

interface Greeter {
  language: string;
  greet(name: string): string;
}

const asGreeter: BindingTemplate = binding => {
  binding.tag('greeter');
};

const greeterFilter: BindingFilter = binding =>
  binding.tagMap['greeter'] != null;

class ChineseGreeter implements Greeter {
  language = 'zh';
  greet(name: string) {
    return `你好，${name}！`;
  }
}

@bind(asGreeter)
class EnglishGreeter implements Greeter {
  language = 'en';
  greet(name: string) {
    return `Hello, ${name}!`;
  }
}

export async function main() {
  const ctx = new Context('request');

  // Add EnglishGreeter for now
  ctx.add(createBindingFromClass(EnglishGreeter, {namespace: 'greeters'}));

  // Add ChineseGreeter
  ctx
    .bind('greeters.ChineseGreeter')
    .toClass(ChineseGreeter)
    .tag('greeter');

  const enlishGreeterBinding = ctx.getBinding('greeters.EnglishGreeter');
  console.log(enlishGreeterBinding.key);

  let possibleEnglishGreeters = ctx.find('*.EnglishGreeter');
  console.log(possibleEnglishGreeters.map(b => b.key));

  possibleEnglishGreeters = ctx.find(/\w+\.EnglishGreeter$/);
  console.log(possibleEnglishGreeters.map(b => b.key));

  let greeterBindings = ctx.findByTag('greeter');
  console.log(greeterBindings.map(b => b.key));

  greeterBindings = ctx.find(filterByTag('greeter'));
  console.log(greeterBindings.map(b => b.key));

  greeterBindings = ctx.find(greeterFilter);
  console.log(greeterBindings.map(b => b.key));

  const view = ctx.createView(greeterFilter, (b1, b2) =>
    b1.key.localeCompare(b2.key),
  );
  console.log(view.bindings.map(b => b.key));
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
