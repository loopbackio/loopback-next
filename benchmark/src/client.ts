// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Todo} from '@loopback/example-todo';
import got from 'got';

export class Client {
  constructor(private url: string) {}

  createTodo(data: Partial<Todo>) {
    return got.post(`${this.url}/todos`, {json: data});
  }

  ping() {
    return got.get(`${this.url}/todos`);
  }
}
