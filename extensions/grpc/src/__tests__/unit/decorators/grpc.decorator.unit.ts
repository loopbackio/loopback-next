// Copyright IBM Corp. 2019. All Rights Reserved.
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
} from '../../acceptance/greeter.proto';

describe('@rpc decorator', () => {
  it('defines reflection metadata for rpc method', () => {
    class GreeterCtrl implements Greeter.Service {
      @grpc(Greeter.SayHello)
      sayHello(request: HelloRequest): HelloReply {
        return {message: `hello ${request.name}`};
      }

      @grpc(Greeter.SayTest)
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
      GreeterCtrl.prototype,
    );
    expect(controllerMethods).to.have.property('sayHello');
  });
});
