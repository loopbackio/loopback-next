// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {grpc, GRPC_METHODS} from '../../..';
import {
  Greeter,
  HelloReply,
  HelloRequest,
  TestReply,
  TestRequest,
} from '../../fixtures/greeter.proto';

describe('@rpc decorator', () => {
  it('defines reflection metadata for rpc method using string', () => {
    class GreeterController implements Greeter.Service {
      @grpc('greeterpackage.Greeter/SayHello')
      sayHello(request: HelloRequest): HelloReply {
        return {message: `hello ${request.name}`};
      }

      @grpc('greeterpackage.Greeter/SayTest')
      sayTest(request: TestRequest): TestReply {
        return {
          message: 'Test ' + request.name,
        };
      }

      helper(): boolean {
        return true;
      }
    }

    const controllerMethods = MetadataInspector.getAllMethodMetadata(
      GRPC_METHODS,
      GreeterController.prototype,
    );
    expect(controllerMethods).to.have.property('sayHello');
    expect(controllerMethods).to.have.property('sayTest');
  });

  it('defines reflection metadata for rpc method using object', () => {
    class GreeterController implements Greeter.Service {
      @grpc({path: 'greeterpackage.Greeter/SayHello'})
      sayHello(request: HelloRequest): HelloReply {
        return {message: `hello ${request.name}`};
      }

      @grpc({
        path: '',
        packageName: 'greeterpackage',
        serviceName: 'Greeter',
        methodName: 'SayTest',
      })
      sayTest(request: TestRequest): TestReply {
        return {
          message: 'Test ' + request.name,
        };
      }

      helper(): boolean {
        return true;
      }
    }

    const controllerMethods = MetadataInspector.getAllMethodMetadata(
      GRPC_METHODS,
      GreeterController.prototype,
    );
    expect(controllerMethods).to.have.property('sayHello');
    expect(controllerMethods).to.have.property('sayTest');
  });
});
