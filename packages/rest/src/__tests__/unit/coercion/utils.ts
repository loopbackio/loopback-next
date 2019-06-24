// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OperationObject, ParameterObject} from '@loopback/openapi-v3';
import {
  expect,
  ShotRequestOptions,
  stubExpressContext,
} from '@loopback/testlab';
import * as HttpErrors from 'http-errors';
import * as qs from 'qs';
import {format} from 'util';
import {
  createResolvedRoute,
  parseOperationArgs,
  PathParameterValues,
  Request,
  RequestBodyParser,
  ResolvedRoute,
  Route,
} from '../../..';

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
    const pathParams: PathParameterValues = {};
    let url = '/';
    const spec = givenOperationWithParameters([config.paramSpec]);
    const route = givenResolvedRoute(spec, pathParams);

    switch (config.paramSpec.in) {
      case 'path':
        pathParams.aparameter = config.rawValue;
        break;
      case 'query':
        {
          const q = qs.stringify(
            {aparameter: config.rawValue},
            {encodeValuesOnly: true},
          );
          url += `?${q}`;
        }
        break;
      case 'header':
      case 'cookie':
        throw new Error(
          `testCoercion does not yet support in:${config.paramSpec.in}`,
        );
      default:
        // An invalid param spec. Pass it through as an empty request
        // to allow the tests to verify how invalid param spec is handled
        break;
    }

    // Create the request after url is fully populated so that request.query
    // is parsed
    const req = givenRequest({url});

    const requestBodyParser = new RequestBodyParser();
    if (config.expectError) {
      await expect(
        parseOperationArgs(req, route, requestBodyParser),
      ).to.be.rejectedWith(config.expectedResult);
    } else {
      const args = await parseOperationArgs(req, route, requestBodyParser);
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
  const testName = buildTestName(rawValue, expectedResult, opts);

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

function buildTestName<T>(
  rawValue: string | undefined | object,
  expectedResult: T,
  opts?: TestOptions,
): string {
  if (opts && opts.testName) return opts.testName;

  const inputString = getPrettyString(rawValue);
  if (expectedResult instanceof HttpErrors.HttpError)
    return `rejects request raw value ${inputString}`;
  const expectedString = getPrettyString(expectedResult);
  return `converts request raw value ${inputString} to ${expectedString}`;
}

function getPrettyString<T>(value: T) {
  switch (typeof value) {
    case 'string':
      return JSON.stringify(value);
    default:
      return format(value);
  }
}
