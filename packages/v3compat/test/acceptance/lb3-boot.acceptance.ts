// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {RestApplication} from '@loopback/rest';
import * as path from 'path';
import {CompatMixin} from '../..';
import {createCompatApplication} from './compat-app';
import {expect} from '@loopback/testlab';
import {AnyStaticMethods} from '../../src';

describe('v3compat (acceptance)', () => {
  class CompatApp extends CompatMixin(BootMixin(RestApplication)) {}

  let app: CompatApp;

  beforeEach(async function givenApplication() {
    app = await createCompatApplication();
    app.v3compat.dataSource('db', {connector: 'memory'});
  });

  describe('when booting simple Todo app', () => {
    beforeEach(async function bootTodoApp() {
      app.projectRoot = path.resolve(__dirname, '../../../fixtures');
      app.bootOptions = {
        v3compat: {
          root: '.',
        },
      };

      await app.boot();
    });

    it('loads models from JSON files', () => {
      expect(
        Object.keys(app.v3compat.registry.modelBuilder.models),
      ).to.containEql('Todo');
    });

    it('creates models using their JSON definitions', () => {
      const Todo = app.v3compat.registry.getModel('Todo');
      expect(Todo.definition.properties).to.containDeep({
        title: {
          type: String,
          required: true,
        },
      });
    });

    it('executes model JS files', () => {
      const Todo = app.v3compat.registry.getModel('Todo');
      expect(Object.keys(Todo)).to.containEql('findByTitle');
      expect(
        ((Todo as unknown) as AnyStaticMethods).findByTitle,
      ).to.be.a.Function();
    });

    it('configures models in the app', () => {
      expect(Object.keys(app.v3compat.models)).to.deepEqual(['Todo']);
    });

    it('attaches models to the configured datasource', () => {
      expect(app.v3compat.models.Todo.dataSource).to.equal(
        app.v3compat.dataSources.db,
      );
    });
  });
});
