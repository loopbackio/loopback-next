import {OperationObject, ParameterObject} from '@loopback/openapi-v3-types';

import {
  ShotRequestOptions,
  expect,
  stubExpressContext,
} from '@loopback/testlab';

import {
  PathParameterValues,
  Request,
  Route,
  createResolvedRoute,
  parseOperationArgs,
  ResolvedRoute,
} from '../../..';
import * as HttpErrors from 'http-errors';

function givenOperationWithParameters(params?: ParameterObject[]) {
  return <OperationObject>{
    'x-operation-name': 'testOp',
    parameters: params,
    responses: {},
  };
}

function givenRequest(options?: ShotRequestOptions): Request {
  return stubExpressContext(options).request;
}

function givenResolvedRoute(
  spec: OperationObject,
  pathParams: PathParameterValues = {},
): ResolvedRoute {
  const route = new Route('get', '/', spec, () => {});
  return createResolvedRoute(route, pathParams);
}

export interface TestArgs<T> {
  paramSpec: ParameterObject;
  rawValue: string | undefined | object;
  expectedResult: T;
  caller: string;
  expectError: boolean;
  opts: TestOptions;
}

export type TestOptions = {
  testName?: string;
};

export async function testCoercion<T>(config: TestArgs<T>) {
  /* istanbul ignore next */
  try {
    const req = givenRequest();
    const spec = givenOperationWithParameters([config.paramSpec]);
    const route = givenResolvedRoute(spec, {aparameter: config.rawValue});

    if (config.expectError) {
      try {
        await parseOperationArgs(req, route);
        throw new Error("'parseOperationArgs' should throw error!");
      } catch (err) {
        expect(err).to.eql(config.expectedResult);
      }
    } else {
      const args = await parseOperationArgs(req, route);
      expect(args).to.eql([config.expectedResult]);
    }
  } catch (err) {
    err.stack += config.caller;
    throw err;
  }
}

export function test<T>(
  paramSpec: ParameterObject,
  rawValue: string | undefined | object,
  expectedResult: T,
  opts?: TestOptions,
) {
  const caller: string = new Error().stack!;
  const DEFAULT_TEST_NAME = `convert request raw value ${rawValue} to ${expectedResult}`;
  const testName = (opts && opts.testName) || DEFAULT_TEST_NAME;

  it(testName, async () => {
    await testCoercion({
      paramSpec,
      rawValue,
      expectedResult,
      caller,
      expectError: expectedResult instanceof HttpErrors.HttpError,
      opts: opts || {},
    });
  });
}
