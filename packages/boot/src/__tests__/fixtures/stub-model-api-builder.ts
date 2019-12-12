// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, Component, createBindingFromClass} from '@loopback/core';
import {
  asModelApiBuilder,
  ModelApiBuilder,
  ModelApiConfig,
} from '@loopback/model-api-builder';
import {Model} from '@loopback/rest';
import {BooterApp} from './application';

export const buildCalls: object[] = [];

@bind(asModelApiBuilder)
class StubModelApiBuilder implements ModelApiBuilder {
  readonly pattern: string = 'stub';
  async build(
    application: BooterApp,
    modelClass: typeof Model & {prototype: Model},
    config: ModelApiConfig,
  ): Promise<void> {
    buildCalls.push({application, modelClass, config});
  }
}

export class StubModelApiBuilderComponent implements Component {
  bindings = [createBindingFromClass(StubModelApiBuilder)];
}

export const samePatternBuildCalls: object[] = [];

@bind(asModelApiBuilder)
class SamePatternModelApiBuilder implements ModelApiBuilder {
  readonly pattern: string = 'same';
  async build(
    application: BooterApp,
    modelClass: typeof Model & {prototype: Model},
    config: ModelApiConfig,
  ): Promise<void> {
    samePatternBuildCalls.push(application);
  }
}

export class SamePatternModelApiBuilderComponent implements Component {
  bindings = [createBindingFromClass(SamePatternModelApiBuilder)];
}

export const similarPatternBuildCalls: object[] = [];

@bind(asModelApiBuilder)
class SimilarPatternModelApiBuilder implements ModelApiBuilder {
  readonly pattern: string = 'same';
  async build(
    application: BooterApp,
    modelClass: typeof Model & {prototype: Model},
    config: ModelApiConfig,
  ): Promise<void> {
    similarPatternBuildCalls.push({modelClass});
  }
}

export class SimilarPatternModelApiBuilderComponent implements Component {
  bindings = [createBindingFromClass(SimilarPatternModelApiBuilder)];
}
