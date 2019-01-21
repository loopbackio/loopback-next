// Copyright IBM Corp. 2018. All Rights Reserved.;
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {HttpErrors, operation, OperationArgs} from '@loopback/rest';
import * as debugFactory from 'debug';
import {
  buildRemoteMethodSpec,
  convertPathFragments,
  convertVerb,
  getClassTags,
} from '../specgen';
import {Lb3ModelController} from './Lb3ModelController';
import {SharedClass} from './shared-class';
import {SharedMethod, joinUrlPaths} from './shared-method';

const debug = debugFactory('loopback:v3compat:rest-adapter');

export class RestAdapter {
  // TODO: make restApiRoot configurable
  readonly restApiRoot = '/api';

  constructor(private readonly _app: Application) {}

  registerSharedClass(sharedClass: SharedClass): void {
    debug('Registering REST API for sharedClass %s', sharedClass.name);
    const sharedMethods = sharedClass.methods();
    const tags = getClassTags(sharedClass);
    const controllerClass = createModelController(sharedClass.name);

    for (const method of sharedMethods) {
      this.registerSharedMethod(method, tags, controllerClass);
    }

    this._app.controller(controllerClass);
  }

  registerSharedMethod(
    sharedMethod: SharedMethod,
    tags: string[] | undefined,
    controllerClass: typeof Lb3ModelController,
  ) {
    debug('  %s', sharedMethod.stringName);

    // TODO: handle methods exposed at multiple http endpoints
    const {verb, path} = sharedMethod.getEndpoints()[0];
    const spec = buildRemoteMethodSpec(sharedMethod, verb, path, tags);

    const prefix = sharedMethod.isStatic ? '' : 'prototype$';
    const key = prefix + sharedMethod.name;

    // Define the controller method to invoke the shared method
    controllerClass.prototype[key] = async function(
      this: Lb3ModelController,
      ...args: OperationArgs
    ) {
      if (!sharedMethod.isStatic) {
        // TODO: invoke sharedCtor to obtain the model instance
        throw new HttpErrors.NotImplemented(
          'Instance-level shared methods are not supported yet.',
        );
      }

      return this.invokeStaticMethod(sharedMethod, args);
    };

    debug('    %s %s %j', verb, path, spec);

    // Define OpenAPI Spec Operation for the shared method
    operation(
      convertVerb(verb),
      joinUrlPaths(this.restApiRoot, convertPathFragments(path)),
      spec,
    )(controllerClass.prototype, key, {});
  }
}

function createModelController(modelName: string): typeof Lb3ModelController {
  // A simple sanitization to handle most common characters
  // that are used in model names but cannot be used as a function/class name.
  // Note that the rules for valid JS indentifiers are way too complex,
  // implementing a fully spec-compliant sanitization is not worth the effort.
  // See https://mathiasbynens.be/notes/javascript-identifiers-es6
  // and createModelClassCtor() in loopback-datasource-juggler's model-builder
  const name = modelName.replace(/[-.:]/g, '_');

  try {
    const factory = new Function(
      'ControllerBase',
      `return class ${name} extends ControllerBase {}`,
    );
    return factory(Lb3ModelController);
  } catch (err) {
    if (err.name === 'SyntaxError') {
      // modelName is not a valid function/class name, e.g. 'grand-child'
      // and our simple sanitization was not good enough.
      // Falling back to an anonymous class
      return class extends Lb3ModelController {};
    }
    throw err;
  }
}
