// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asGlobalInterceptor,
  AsyncProxy,
  bind,
  BindingKey,
  BindingScope,
  Context,
  createBindingFromClass,
  inject,
  Interceptor,
  InvocationContext,
  Provider,
  ValueOrPromise,
} from '@loopback/context';

type RequestIdGenerator = (requestCtx: Context) => string;

const REQUEST_CONTEXT = BindingKey.create<Context>('request.context');
const REQUEST_ID = BindingKey.create<string>('tracing.requestId');
const REQUEST_ID_GENERATOR = BindingKey.create<RequestIdGenerator>(
  'tracing.requestIdGenerator',
);

const TRACING_INTERCEPTOR = BindingKey.create<Interceptor>(
  'tracing.interceptor',
);

const CONVERTER = BindingKey.create<Converter>('converter');
const GREETER = BindingKey.create<Greeter>('greeter');

@bind(asGlobalInterceptor('tracing'))
class TracingInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(REQUEST_ID_GENERATOR) private generator: RequestIdGenerator,
  ) {}

  value() {
    return this.intercept.bind(this);
  }

  async intercept<T>(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<T>,
  ) {
    const reqCtx = invocationCtx.getSync(REQUEST_CONTEXT);
    let reqId = await reqCtx.get(REQUEST_ID, {optional: true});
    if (!reqId) {
      reqId = this.generator(reqCtx);
      // We need to set request id to `reqCtx` as `invocationCtx` is transient
      reqCtx.bind(REQUEST_ID).to(reqId);
      console.log(
        'Adding request id at %s: %s',
        invocationCtx.targetName,
        reqId,
      );
    } else {
      console.log(
        'Request id found at %s: %s',
        invocationCtx.targetName,
        reqId,
      );
    }
    return next();
  }
}

class Converter {
  toUpperCase(name: string) {
    return name.toUpperCase();
  }
}

class Greeter {
  @inject(CONVERTER, {asProxyWithInterceptors: true})
  private converter: AsyncProxy<Converter>;

  async greet(name: string) {
    const msg = await this.converter.toUpperCase(name);
    return `Hello, ${msg}`;
  }
}

export async function main() {
  const ctx = new Context('request');
  // Bind request context
  ctx.bind(REQUEST_CONTEXT).to(ctx);

  const binding = createBindingFromClass(TracingInterceptor, {
    key: TRACING_INTERCEPTOR,
  });
  ctx.add(binding);

  let count = 1;
  const reqUuidGenerator: RequestIdGenerator = context =>
    `[${context.name}] ${count++}`;
  ctx.bind(REQUEST_ID_GENERATOR).to(reqUuidGenerator);
  ctx.bind(GREETER).toClass(Greeter);
  ctx
    .bind(CONVERTER)
    .toClass(Converter)
    .tag(BindingScope.SINGLETON);

  const greeter = await ctx.get(GREETER, {asProxyWithInterceptors: true});
  console.log(await greeter!.greet('John'));
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
