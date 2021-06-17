// Copyright The LoopBack Authors 2018,2021. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ScenarioFactory} from '../benchmark';
import {CreateTodo} from './create-todo.scenario';
import {FindTodos} from './find-todos.scenario';

export interface ScenarioMap {
  [name: string]: ScenarioFactory;
}

export const scenarios: ScenarioMap = {
  'find all todos': FindTodos,
  // IMPORTANT NOTE(bajtos) the find scenario must run before create.
  // Otherwise weird data is reported. I was not able to find the cause.
  'create a new todo': CreateTodo,
};
