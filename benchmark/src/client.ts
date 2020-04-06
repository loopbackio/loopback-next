// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Todo} from '@loopback/example-todo';
import axios from 'axios';

export class Client {
  constructor(private url: string) {}

  createTodo(data: Partial<Todo>) {
    return axios.post(`${this.url}/todos`, data, {
      responseType: 'json',
    });
  }

  ping() {
    return axios.get(`${this.url}/todos`);
  }
}
