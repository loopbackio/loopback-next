// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Booter} from '@loopback/booter';
import {
  Binding,
  Component,
  Constructor,
  createBindingFromClass,
} from '@loopback/core';
import {ModelApiBooter} from '@loopback/model-api-builder';
import {CrudRestApiBuilder} from './crud-rest.api-builder';

export class CrudRestComponent implements Component {
  bindings: Binding[] = [createBindingFromClass(CrudRestApiBuilder)];
  booters: Constructor<Booter>[] = [ModelApiBooter];
}
