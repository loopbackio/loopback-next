// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const {getIdFromModel} = require('../../../lib/ast-helper');
const {expect} = require('@loopback/testlab');

describe('getIdFromModel', () => {
  it('returns null when no id property was found', () => {
    const modelCode = `
        @model()
        class Product extends Entity {}
      `;
    const id = getIdFromModel(modelCode);

    expect(id).to.equal(null);
  });

  context('@property() decorator', () => {
    it('detects `{id: true}`', () => {
      const modelCode = `
        @model()
        class Product extends Entity {
          @property({required: true})
          name: string;

          @property({id: true})
          primaryKey: number;
        }
      `;
      const id = getIdFromModel(modelCode);

      expect(id).to.equal('primaryKey');
    });

    it('ignores `{id: false}`', () => {
      const modelCode = `
        @model()
        class Product extends Entity {
          @property({id: false})
          name: string;
        }
      `;
      const id = getIdFromModel(modelCode);

      expect(id).to.equal(null);
    });

    it('detects `{id: 1}`', () => {
      const modelCode = `
        @model()
        class Product extends Entity {
          @property({required: true})
          name: string;

          @property({id: 1})
          primaryKey: number;
        }
      `;
      const id = getIdFromModel(modelCode);

      expect(id).to.equal('primaryKey');
    });

    it('ignores `{id: 0}`', () => {
      const modelCode = `
        @model()
        class Product extends Entity {
          @property({id: 0})
          name: string;
        }
      `;
      const id = getIdFromModel(modelCode);

      expect(id).to.equal(null);
    });
  });

  context('@model({properties:{}}) decorator', () => {
    it('detects `{id: true}`', () => {
      const modelCode = `
        @model({
          properties: {
            name: {type: string, required: true}
            primaryKey: {type: number, id: true}
          },
        })
        class Product extends Entity {}
      `;
      const id = getIdFromModel(modelCode);

      expect(id).to.equal('primaryKey');
    });

    it('ignores `{id: false}`', () => {
      const modelCode = `
        @model({
          properties: {
            name: {type: string, id: false}
          },
        })
        class Product extends Entity {}
      `;
      const id = getIdFromModel(modelCode);

      expect(id).to.equal(null);
    });

    it('detects `{id: 1}`', () => {
      const modelCode = `
        @model({
          properties: {
            name: {type: string, required: true}
            primaryKey: {type: number, id: 1}
          },
        })
        class Product extends Entity {}
      `;
      const id = getIdFromModel(modelCode);

      expect(id).to.equal('primaryKey');
    });

    it('ignores `{id: 0}`', () => {
      const modelCode = `
        @model({
          properties: {
            name: {type: string, id: 0}
          },
        })
        class Product extends Entity {}
      `;
      const id = getIdFromModel(modelCode);

      expect(id).to.equal(null);
    });
  });

  context('static model property `definition`', () => {
    it('detects `{id: true}`', () => {
      const modelCode = `
        class Product extends Entity {
          static definition = {
            properties: {
              name: {type: string, required: true}
              primaryKey: {type: number, id: true}
            },
          };
        }
      `;
      const id = getIdFromModel(modelCode);

      expect(id).to.equal('primaryKey');
    });

    it('ignores `{id: false}`', () => {
      const modelCode = `
        class Product extends Entity {
          static definition = {
            properties: {
              name: {type: string, id: false}
            },
          };
        }
      `;
      const id = getIdFromModel(modelCode);

      expect(id).to.equal(null);
    });

    it('detects `{id: 1}`', () => {
      const modelCode = `
        class Product extends Entity {
          static definition = {
            properties: {
              name: {type: string, required: true}
              primaryKey: {type: number, id: 1}
            },
          };
        }
      `;
      const id = getIdFromModel(modelCode);

      expect(id).to.equal('primaryKey');
    });

    it('ignores `{id: 0}`', () => {
      const modelCode = `
        class Product extends Entity {
          static definition = {
            properties: {
              name: {type: string, id: 0}
            },
          };
        }
      `;
      const id = getIdFromModel(modelCode);

      expect(id).to.equal(null);
    });
  });
});
