// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {get, getControllerSpec, param} from '@loopback/openapi-v3';
import {
  ShotRequestOptions,
  expect,
  stubExpressContext,
} from '@loopback/testlab';
import {
  ControllerRoute,
  Request,
  RoutingTable,
  RestRouter,
  RegExpRouter,
  TrieRouter,
} from '../../..';

describe('RoutingTable', () => {
  it('joins basePath and path', () => {
    expect(RoutingTable.joinPath('', 'a')).to.equal('/a');
    expect(RoutingTable.joinPath('/', '')).to.equal('/');
    expect(RoutingTable.joinPath('/', 'a')).to.equal('/a');
    expect(RoutingTable.joinPath('/root', 'a')).to.equal('/root/a');
    expect(RoutingTable.joinPath('root', 'a')).to.equal('/root/a');
    expect(RoutingTable.joinPath('root/', '/a')).to.equal('/root/a');
    expect(RoutingTable.joinPath('root/', '/a/')).to.equal('/root/a');
    expect(RoutingTable.joinPath('/root/', '/a/')).to.equal('/root/a');
    expect(RoutingTable.joinPath('/root//x', '/a')).to.equal('/root/x/a');
    expect(RoutingTable.joinPath('/root/', '/')).to.equal('/root');
    expect(RoutingTable.joinPath('/root/x', '/a/b')).to.equal('/root/x/a/b');
    expect(RoutingTable.joinPath('//root//x', '//a///b////c')).to.equal(
      '/root/x/a/b/c',
    );
  });
});

describe('RoutingTable with RegExpRouter', () => {
  runTestsWithRouter(new RegExpRouter());
});

describe('RoutingTable with TrieRouter', () => {
  runTestsWithRouter(new TrieRouter());
});

function runTestsWithRouter(router: RestRouter) {
  it('does not fail if some of the parameters are not decorated', () => {
    class TestController {
      @get('/greet')
      greet(prefix: string, @param.query.string('message') message: string) {
        return prefix + ': ' + message;
      }
    }
    const spec = getControllerSpec(TestController);
    const table = givenRoutingTable();
    table.registerController(spec, TestController);
    const paths = table.describeApiPaths();
    const params = paths['/greet']['get'].parameters;
    expect(params).to.have.property('length', 1);
    expect(params[0]).to.have.properties({
      name: 'message',
      in: 'query',
      schema: {type: 'string'},
    });
  });

  it('finds simple "GET /hello" endpoint', () => {
    const spec = anOpenApiSpec()
      .withOperationReturningString('get', '/hello', 'greet')
      .build();

    class TestController {}

    const table = givenRoutingTable();
    table.registerController(spec, TestController);

    const request = givenRequest({
      method: 'get',
      url: '/hello',
    });

    const route = table.find(request);

    expect(route).to.be.instanceOf(ControllerRoute);
    expect(route)
      .to.have.property('spec')
      .containEql(spec.paths['/hello'].get);
    expect(route).to.have.property('pathParams');
    expect(route.describe()).to.equal('TestController.greet');
  });

  it('finds simple "GET /my/hello" endpoint', () => {
    const spec = anOpenApiSpec()
      .withOperationReturningString('get', '/hello', 'greet')
      .build();

    // @jannyHou: please note ` anOpenApiSpec()` returns an openapi spec,
    // not controller spec, should be FIXED
    // the routing table test expects an empty spec for
    // interface `ControllerSpec`
    spec.basePath = '/my';

    class TestController {}

    const table = givenRoutingTable();
    table.registerController(spec, TestController);

    const request = givenRequest({
      method: 'get',
      url: '/my/hello',
    });

    const route = table.find(request);

    expect(route).to.be.instanceOf(ControllerRoute);
    expect(route)
      .to.have.property('spec')
      .containEql(spec.paths['/hello'].get);
    expect(route).to.have.property('pathParams');
    expect(route.describe()).to.equal('TestController.greet');
  });

  it('finds simple "GET /hello/world" endpoint', () => {
    const spec = anOpenApiSpec()
      .withOperationReturningString('get', '/hello/{msg}', 'greet')
      .withOperationReturningString('get', '/hello/world', 'greetWorld')
      .build();

    class TestController {}

    const table = givenRoutingTable();
    table.registerController(spec, TestController);

    const request = givenRequest({
      method: 'get',
      url: '/hello/world',
    });

    const route = table.find(request);
    expect(route)
      .to.have.property('spec')
      .containEql(spec.paths['/hello/world'].get);
    expect(route).to.have.property('pathParams', {});
    expect(route.describe()).to.equal('TestController.greetWorld');
  });

  it('finds simple "GET /add/{arg1}/{arg2}" endpoint', () => {
    const spec = anOpenApiSpec()
      .withOperationReturningString('get', '/add/{arg1}/{arg2}', 'add')
      .withOperationReturningString(
        'get',
        '/subtract/{arg1}/{arg2}',
        'subtract',
      )
      .build();

    // @jannyHou: please note ` anOpenApiSpec()` returns an openapi spec,
    // not controller spec, should be FIXED
    // the routing table test expects an empty spec for
    // interface `ControllerSpec`
    spec.basePath = '/my';

    class TestController {}

    const table = givenRoutingTable();
    table.registerController(spec, TestController);

    let request = givenRequest({
      method: 'get',
      url: '/my/add/1/2',
    });

    let route = table.find(request);
    expect(route.path).to.eql('/my/add/{arg1}/{arg2}');
    expect(route.pathParams).to.containEql({arg1: '1', arg2: '2'});

    request = givenRequest({
      method: 'get',
      url: '/my/subtract/3/2',
    });

    route = table.find(request);
    expect(route.path).to.eql('/my/subtract/{arg1}/{arg2}');
    expect(route.pathParams).to.containEql({arg1: '3', arg2: '2'});
  });

  function givenRequest(options?: ShotRequestOptions): Request {
    return stubExpressContext(options).request;
  }

  function givenRoutingTable() {
    return new RoutingTable(router);
  }
}
