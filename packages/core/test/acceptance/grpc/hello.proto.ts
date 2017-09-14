// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ValueOrPromise} from '@loopback/context';

// TODO(bajtos) Generate the following three interfaces from hello.proto

export interface HelloRequest {
  name: string;
}

export interface HelloResponse {
  message: string;
}

export interface Greeter {
  hello(request: HelloRequest): ValueOrPromise<HelloResponse>;
}
