// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {Entity, model, property, RepositoryMixin} from '@loopback/repository';
import {Model} from '@loopback/rest';
import {expect} from '@loopback/testlab';
import {CrudRestApiBuilder, CrudRestComponent} from '../..';

// ---------------------------------------------------------------------------
// Minimal ApplicationWithRepositories used across all tests
// ---------------------------------------------------------------------------

class TestApp extends RepositoryMixin(Application) {}

// ---------------------------------------------------------------------------
// Shared model fixtures
// ---------------------------------------------------------------------------

@model()
class Product extends Entity {
  @property({id: true})
  id: number;

  @property({required: true})
  name: string;
}

@model()
class NonEntity extends Model {
  @property({id: true})
  id: number;
}

// ---------------------------------------------------------------------------
// CrudRestComponent
// ---------------------------------------------------------------------------

describe('CrudRestComponent', () => {
  it('registers CrudRestApiBuilder binding when added to an application', () => {
    const app = new TestApp();
    app.component(CrudRestComponent);

    expect(app.isBound('model-api-builders.CrudRestApiBuilder')).to.be.true();
  });
});

// ---------------------------------------------------------------------------
// CrudRestApiBuilder
// ---------------------------------------------------------------------------

describe('CrudRestApiBuilder', () => {
  let app: TestApp;
  let builder: CrudRestApiBuilder;

  beforeEach(() => {
    app = new TestApp();
    builder = new CrudRestApiBuilder();
  });

  it('has pattern "CrudRest"', () => {
    expect(builder.pattern).to.equal('CrudRest');
  });

  describe('build()', () => {
    it('throws when basePath is missing from config', async () => {
      let caught: Error | undefined;
      try {
        await builder.build(
          app,
          Product as typeof Model & {prototype: Model},
          {
            model: Product,
            pattern: 'CrudRest',
            dataSource: 'db',
            // basePath intentionally omitted
          } as never,
        );
      } catch (err) {
        caught = err as Error;
      }
      expect(caught).to.not.be.undefined();
      expect(caught!.message).to.match(/missing required field.*basePath/i);
    });

    it('throws when model does not extend Entity', async () => {
      let caught: Error | undefined;
      try {
        await builder.build(
          app,
          NonEntity as typeof Model & {prototype: Model},
          {
            model: NonEntity,
            pattern: 'CrudRest',
            dataSource: 'db',
            basePath: '/non-entities',
          },
        );
      } catch (err) {
        caught = err as Error;
      }
      expect(caught).to.not.be.undefined();
      expect(caught!.message).to.match(
        /requires a model that extends.*Entity/i,
      );
    });

    it('registers a repository and controller when the repo binding is absent', async () => {
      await builder.build(app, Product as typeof Model & {prototype: Model}, {
        model: Product,
        pattern: 'CrudRest',
        dataSource: 'db',
        basePath: '/products',
      });

      // A controller binding should exist
      const controllerBinding = app
        .findByTag('controller')
        .find(b => b.key.includes('Product'));
      expect(controllerBinding).to.not.be.undefined();
    });

    it('skips repository creation when the repo binding already exists', async () => {
      // Bind the repository manually before calling build()
      const repoBindingName = 'repositories.ProductRepository';
      // Use a minimal stub — the builder only checks isBound()
      app.bind(repoBindingName).to({} as never);

      // Should not throw; should reuse the existing binding
      await builder.build(app, Product as typeof Model & {prototype: Model}, {
        model: Product,
        pattern: 'CrudRest',
        dataSource: 'db',
        basePath: '/products',
      });

      // Controller should still be registered
      const controllerBinding = app
        .findByTag('controller')
        .find(b => b.key.includes('Product'));
      expect(controllerBinding).to.not.be.undefined();
    });

    it('registers a readonly controller when readonly option is true', async () => {
      await builder.build(app, Product as typeof Model & {prototype: Model}, {
        model: Product,
        pattern: 'CrudRest',
        dataSource: 'db',
        basePath: '/products',
        readonly: true,
      });

      const controllerBinding = app
        .findByTag('controller')
        .find(b => b.key.includes('Product'));
      expect(controllerBinding).to.not.be.undefined();

      // Verify that the bound controller class prototype has no `create`
      // (without resolving — that would require a real datasource).
      const ControllerClass = controllerBinding!.valueConstructor;
      expect(ControllerClass).to.not.be.undefined();
      expect(ControllerClass!.prototype.create).to.be.undefined();
    });
  });
});
