// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector} from '@loopback/context';
import {
  belongsTo,
  Entity,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {
  getJsonSchema,
  JsonSchema,
  JSON_SCHEMA_KEY,
  modelToJsonSchema,
  MODEL_TYPE_KEYS,
} from '../..';
import {expectValidJsonSchema} from '../helpers/expect-valid-json-schema';

describe('build-schema', () => {
  describe('modelToJsonSchema', () => {
    context('properties conversion', () => {
      it('does not convert null or undefined property', () => {
        @model()
        class TestModel {
          @property()
          nul: null;
          @property()
          undef: undefined;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.not.have.keys(['nul', 'undef']);
        expectValidJsonSchema(jsonSchema);
      });

      it('does not convert properties that have not been decorated', () => {
        @model()
        class NoPropertyMeta {
          prop: string;
        }

        @model()
        class OnePropertyDecorated {
          @property()
          foo: string;
          bar: boolean;
          baz: number;
        }

        const noPropJson = modelToJsonSchema(NoPropertyMeta);
        const onePropJson = modelToJsonSchema(OnePropertyDecorated);
        expect(noPropJson).to.not.have.key('properties');
        expectValidJsonSchema(noPropJson);
        expect(onePropJson.properties).to.deepEqual({
          foo: {
            type: 'string',
          },
        });
        expectValidJsonSchema(onePropJson);
      });

      it('does not convert models that have not been decorated with @model()', () => {
        class Empty {}

        class NoModelMeta {
          @property()
          foo: string;
          bar: number;
        }

        const emptyJson = modelToJsonSchema(Empty);
        const noModelMetaJson = modelToJsonSchema(NoModelMeta);
        expect(emptyJson).to.eql({});
        expectValidJsonSchema(emptyJson);
        expect(noModelMetaJson).to.eql({});
        expectValidJsonSchema(noModelMetaJson);
      });

      it('infers "title" property from constructor name', () => {
        @model()
        class TestModel {
          @property()
          foo: string;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.title).to.eql('TestModel');
        expectValidJsonSchema(jsonSchema);
      });

      it('overrides "title" property if explicitly given', () => {
        @model({title: 'NewName'})
        class TestModel {
          @property()
          foo: string;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.title).to.eql('NewName');
        expectValidJsonSchema(jsonSchema);
      });

      it('retains "description" properties from top-level metadata', () => {
        const topMeta = {
          description: 'Test description',
        };

        @model(topMeta)
        class TestModel {
          @property()
          foo: string;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.description).to.eql(topMeta.description);
        expectValidJsonSchema(jsonSchema);
      });

      it('properly converts string, number, and boolean properties', () => {
        @model()
        class TestModel {
          @property()
          str: string;
          @property()
          num: number;
          @property()
          bool: boolean;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.deepEqual({
          str: {
            type: 'string',
          },
          num: {
            type: 'number',
          },
          bool: {
            type: 'boolean',
          },
        });
        expectValidJsonSchema(jsonSchema);
      });

      it('properly converts date property', () => {
        @model()
        class TestModel {
          @property()
          date: Date;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.deepEqual({
          date: {
            type: 'string',
            format: 'date-time',
          },
        });
        expectValidJsonSchema(jsonSchema);
      });

      it('properly converts object properties', () => {
        @model()
        class TestModel {
          @property()
          obj: object;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.deepEqual({
          obj: {
            type: 'object',
          },
        });
        expectValidJsonSchema(jsonSchema);
      });

      it('properly converts primitive array properties', () => {
        @model()
        class TestModel {
          @property.array(Number)
          numArr: number[];
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.deepEqual({
          numArr: {
            type: 'array',
            items: {
              type: 'number',
            },
          },
        });
        expectValidJsonSchema(jsonSchema);
      });

      it('properly converts optional primitive array properties', () => {
        @model()
        class TestModel {
          @property.array('number')
          numArr?: number[];
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.deepEqual({
          numArr: {
            type: 'array',
            items: {
              type: 'number',
            },
          },
        });
        expectValidJsonSchema(jsonSchema);
      });

      it('properly converts properties with recursive arrays', () => {
        @model()
        class RecursiveArray {
          @property.array(Array)
          recArr: string[][];
        }

        const jsonSchema = modelToJsonSchema(RecursiveArray);
        expect(jsonSchema.properties).to.eql({
          recArr: {
            type: 'array',
            items: {
              type: 'array',
            },
          },
        });
      });

      it('supports explicit primitive type decoration via strings', () => {
        @model()
        class TestModel {
          @property({type: 'string'})
          hardStr: number;
          @property({type: 'boolean'})
          hardBool: string;
          @property({type: 'number'})
          hardNum: boolean;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.deepEqual({
          hardStr: {
            type: 'string',
          },
          hardBool: {
            type: 'boolean',
          },
          hardNum: {
            type: 'number',
          },
        });
        expectValidJsonSchema(jsonSchema);
      });

      it('maps "required" keyword to the schema appropriately', () => {
        @model()
        class TestModel {
          @property({required: false})
          propOne: string;
          @property({required: true})
          propTwo: string;
          @property()
          propThree: number;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.required).to.deepEqual(['propTwo']);
        expectValidJsonSchema(jsonSchema);
      });

      it('errors out when explicit type decoration is not primitive', () => {
        @model()
        class TestModel {
          @property({type: 'NotPrimitive'})
          bad: string;
        }

        expect(() => modelToJsonSchema(TestModel)).to.throw(/Unsupported type/);
      });

      it('properly converts array of types defined by strings', () => {
        @model()
        class TestModel {
          @property({type: 'array', itemType: 'number'})
          num: number[];
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.eql({
          num: {
            type: 'array',
            items: {
              type: 'number',
            },
          },
        });
      });

      context('with custom type properties', () => {
        it('properly converts undecorated custom type properties', () => {
          class CustomType {
            prop: string;
          }

          @model()
          class TestModel {
            @property()
            cusType: CustomType;
          }

          const jsonSchema = modelToJsonSchema(TestModel);
          expect(jsonSchema.properties).to.deepEqual({
            cusType: {
              $ref: '#/definitions/CustomType',
            },
          });
          expect(jsonSchema).to.not.have.key('definitions');
          expectValidJsonSchema(jsonSchema);
        });

        it('properly converts decorated custom type properties', () => {
          @model()
          class CustomType {
            @property()
            prop: string;
          }

          @model()
          class TestModel {
            @property()
            cusType: CustomType;
          }

          const jsonSchema = modelToJsonSchema(TestModel);
          expect(jsonSchema.properties).to.deepEqual({
            cusType: {
              $ref: '#/definitions/CustomType',
            },
          });
          expect(jsonSchema.definitions).to.deepEqual({
            CustomType: {
              title: 'CustomType',
              properties: {
                prop: {
                  type: 'string',
                },
              },
              additionalProperties: false,
            },
          });
          expectValidJsonSchema(jsonSchema);
        });

        it('properly converts undecorated custom array type properties', () => {
          class CustomType {
            prop: string;
          }

          @model()
          class TestModel {
            @property.array(CustomType)
            cusArr: CustomType[];
          }

          const jsonSchema = modelToJsonSchema(TestModel);
          expect(jsonSchema.properties).to.deepEqual({
            cusArr: {
              type: 'array',
              items: {
                $ref: '#/definitions/CustomType',
              },
            },
          });
          expectValidJsonSchema(jsonSchema);
        });

        it('properly converts decorated custom array type properties', () => {
          @model()
          class CustomType {
            @property()
            prop: string;
          }

          @model()
          class TestModel {
            @property.array(CustomType)
            cusType: CustomType[];
          }

          const jsonSchema = modelToJsonSchema(TestModel);
          expect(jsonSchema.properties).to.deepEqual({
            cusType: {
              type: 'array',
              items: {$ref: '#/definitions/CustomType'},
            },
          });
          expect(jsonSchema.definitions).to.deepEqual({
            CustomType: {
              title: 'CustomType',
              properties: {
                prop: {
                  type: 'string',
                },
              },
              additionalProperties: false,
            },
          });
          expectValidJsonSchema(jsonSchema);
        });

        it('properly handles AJV keywords in property decorator', () => {
          @model()
          class TestModel {
            @property({
              type: 'string',
              required: true,
              jsonSchema: {
                format: 'email',
                maxLength: 50,
                minLength: 5,
              },
            })
            email: string;

            @property({
              type: 'string',
              required: true,
              jsonSchema: {
                pattern: '(a|b|c)',
              },
            })
            type: string;
          }

          const jsonSchema = modelToJsonSchema(TestModel);
          expect(jsonSchema.properties).to.eql({
            email: {
              type: 'string',
              format: 'email',
              maxLength: 50,
              minLength: 5,
            },
            type: {
              type: 'string',
              pattern: '(a|b|c)',
            },
          });
        });

        it('properly converts decorated custom array type with a resolver', () => {
          @model()
          class Address {
            @property()
            city: string;
          }

          @model()
          class TestModel {
            @property.array(() => Address)
            addresses: Address[];
          }

          const jsonSchema = modelToJsonSchema(TestModel);
          expect(jsonSchema.properties).to.deepEqual({
            addresses: {
              type: 'array',
              items: {$ref: '#/definitions/Address'},
            },
          });
          expect(jsonSchema.definitions).to.deepEqual({
            Address: {
              title: 'Address',
              properties: {
                city: {
                  type: 'string',
                },
              },
              additionalProperties: false,
            },
          });
          expectValidJsonSchema(jsonSchema);
        });

        it('properly converts models with hasMany/belongsTo relation', () => {
          @model()
          class Order extends Entity {
            @property({id: true})
            id: number;

            @belongsTo(() => Customer)
            customerId: number;
          }

          @model()
          class Customer extends Entity {
            @property({id: true})
            id: number;

            @hasMany(() => Order)
            orders: Order[];
          }

          const orderSchema = modelToJsonSchema(Order);
          const customerSchema = modelToJsonSchema(Customer);

          expectValidJsonSchema(customerSchema);
          expectValidJsonSchema(orderSchema);

          expect(orderSchema.properties).to.deepEqual({
            id: {type: 'number'},
            customerId: {type: 'number'},
          });
          expect(customerSchema.properties).to.deepEqual({
            id: {type: 'number'},
          });
          expect(customerSchema.properties).to.not.containDeep({
            orders: {
              type: 'array',
              items: {$ref: '#/definitions/Order'},
            },
          });
          expect(customerSchema.definitions).to.not.containEql({
            Order: {
              title: 'Order',
              properties: {
                id: {
                  type: 'number',
                },
                customerId: {type: 'number'},
              },
              additionalProperties: false,
            },
          });
        });

        it('creates definitions only at the root level of the schema', () => {
          @model()
          class CustomTypeFoo {
            @property()
            prop: string;
          }

          @model()
          class CustomTypeBar {
            @property.array(CustomTypeFoo)
            prop: CustomTypeFoo[];
          }

          @model()
          class TestModel {
            @property()
            cusBar: CustomTypeBar;
          }

          const jsonSchema = modelToJsonSchema(TestModel);
          const schemaProps = jsonSchema.properties;
          const schemaDefs = jsonSchema.definitions;
          expect(schemaProps).to.deepEqual({
            cusBar: {
              $ref: '#/definitions/CustomTypeBar',
            },
          });
          expect(schemaDefs).to.deepEqual({
            CustomTypeFoo: {
              title: 'CustomTypeFoo',
              properties: {
                prop: {
                  type: 'string',
                },
              },
              additionalProperties: false,
            },
            CustomTypeBar: {
              title: 'CustomTypeBar',
              properties: {
                prop: {
                  type: 'array',
                  items: {
                    $ref: '#/definitions/CustomTypeFoo',
                  },
                },
              },
              additionalProperties: false,
            },
          });
          expectValidJsonSchema(jsonSchema);
        });
      });
    });

    context('model conversion', () => {
      @model()
      class Category {
        @property.array(() => Product)
        products?: Product[];
      }

      @model()
      class Product {
        @property(() => Category)
        category?: Category;
      }

      const expectedSchema = {
        title: 'Category',
        properties: {
          products: {
            type: 'array',
            items: {$ref: '#/definitions/Product'},
          },
        },
        additionalProperties: false,
        definitions: {
          Product: {
            title: 'Product',
            properties: {
              category: {
                $ref: '#/definitions/Category',
              },
            },
            additionalProperties: false,
          },
        },
      };

      it('handles circular references', () => {
        const schema = modelToJsonSchema(Category);
        expect(schema).to.deepEqual(expectedSchema);
      });
    });

    context('additionalProperties', () => {
      it('assumes "strict: true" when not set', () => {
        @model()
        class DefaultModel {}

        const schema = modelToJsonSchema(DefaultModel);
        expect(schema).to.containDeep({
          additionalProperties: false,
        });
      });

      it('respects model setting "strict: true"', () => {
        @model({settings: {strict: true}})
        class StrictModel {}

        const schema = modelToJsonSchema(StrictModel);
        expect(schema).to.containDeep({
          additionalProperties: false,
        });
      });

      it('respects model setting "strict: false"', () => {
        @model({settings: {strict: false}})
        class FreeFormModel {}

        const schema = modelToJsonSchema(FreeFormModel);
        expect(schema).to.containDeep({
          additionalProperties: true,
        });
      });
    });

    it('uses title from model metadata instead of model name', () => {
      @model({title: 'MyCustomer'})
      class Customer {}

      const schema = modelToJsonSchema(Customer, {
        // trigger build of a custom title
        partial: true,
      });

      expect(schema.title).to.equal('MyCustomerPartial');
    });

    it('uses title from options instead of model name and computed suffix', () => {
      @model({title: 'ShouldBeIgnored'})
      class TestModel {
        @property()
        id: string;
      }

      const schema = modelToJsonSchema(TestModel, {
        title: 'NewTestModel',
        partial: true,
        exclude: ['id'],
      });

      expect(schema.title).to.equal('NewTestModel');
    });
  });

  describe('getJsonSchema', () => {
    it('gets cached JSON schema if one exists', () => {
      @model()
      class TestModel {
        @property()
        foo: number;
      }

      const cachedSchema: JsonSchema = {
        properties: {
          cachedProperty: {
            type: 'string',
          },
        },
      };
      MetadataInspector.defineMetadata(
        JSON_SCHEMA_KEY,
        {[MODEL_TYPE_KEYS.ModelOnly]: cachedSchema},
        TestModel,
      );
      const jsonSchema = getJsonSchema(TestModel);
      expect(jsonSchema).to.eql(cachedSchema);
    });
    it('creates JSON schema if one does not already exist', () => {
      @model()
      class NewModel {
        @property()
        newProperty: string;
      }

      const jsonSchema = getJsonSchema(NewModel);
      expect(jsonSchema.properties).to.deepEqual({
        newProperty: {
          type: 'string',
        },
      });
    });
    it('does not pollute the JSON schema options', () => {
      @model()
      class Category {
        @property()
        name: string;
      }

      const JSON_SCHEMA_OPTIONS = {};
      getJsonSchema(Category, JSON_SCHEMA_OPTIONS);
      expect(JSON_SCHEMA_OPTIONS).to.be.empty();
    });
    context('circular reference', () => {
      @model()
      class Category {
        @property.array(() => Product)
        products?: Product[];
      }

      @model()
      class Product {
        @property(() => Category)
        category?: Category;
      }

      const expectedSchemaForCategory = {
        title: 'Category',
        properties: {
          products: {
            type: 'array',
            items: {$ref: '#/definitions/Product'},
          },
        },
        additionalProperties: false,
        definitions: {
          Product: {
            title: 'Product',
            properties: {
              category: {
                $ref: '#/definitions/Category',
              },
            },
            additionalProperties: false,
          },
        },
      };

      it('generates the schema without running into infinite loop', () => {
        const schema = getJsonSchema(Category);
        expect(schema).to.deepEqual(expectedSchemaForCategory);
      });
    });

    it('converts HasMany and BelongsTo relation links', () => {
      @model()
      class Product extends Entity {
        @property({id: true})
        id: number;

        @belongsTo(() => Category)
        categoryId: number;
      }

      @model()
      class Category extends Entity {
        @property({id: true})
        id: number;

        @hasMany(() => Product)
        products?: Product[];
      }

      const expectedSchema: JsonSchema = {
        definitions: {
          ProductWithRelations: {
            title: 'ProductWithRelations',
            description: `(Schema options: { includeRelations: true })`,
            properties: {
              id: {type: 'number'},
              categoryId: {type: 'number'},
              category: {$ref: '#/definitions/CategoryWithRelations'},
            },
            additionalProperties: false,
          },
        },
        properties: {
          id: {type: 'number'},
          products: {
            type: 'array',
            items: {$ref: '#/definitions/ProductWithRelations'},
          },
        },
        additionalProperties: false,
        title: 'CategoryWithRelations',
        description: `(Schema options: { includeRelations: true })`,
      };
      const jsonSchema = getJsonSchema(Category, {includeRelations: true});
      expect(jsonSchema).to.deepEqual(expectedSchema);
    });

    it('converts relation links when no other properties there', () => {
      @model()
      class Product extends Entity {
        @property({id: true})
        id: number;

        @belongsTo(() => CategoryWithoutProp)
        categoryId: number;
      }

      @model()
      class CategoryWithoutProp extends Entity {
        @hasMany(() => Product)
        products?: Product[];
      }
      const expectedSchema: JsonSchema = {
        definitions: {
          ProductWithRelations: {
            title: 'ProductWithRelations',
            description: `(Schema options: { includeRelations: true })`,
            properties: {
              id: {type: 'number'},
              categoryId: {type: 'number'},
              category: {
                $ref: '#/definitions/CategoryWithoutPropWithRelations',
              },
            },
            additionalProperties: false,
          },
        },
        properties: {
          products: {
            type: 'array',
            items: {$ref: '#/definitions/ProductWithRelations'},
          },
        },
        additionalProperties: false,
        title: 'CategoryWithoutPropWithRelations',
        description: `(Schema options: { includeRelations: true })`,
      };

      // To check for case when there are no other properties than relational
      const jsonSchemaWithoutProp = getJsonSchema(CategoryWithoutProp, {
        includeRelations: true,
      });
      expect(jsonSchemaWithoutProp).to.deepEqual(expectedSchema);
    });

    it('gets cached JSON schema with relation links if one exists', () => {
      @model()
      class Product extends Entity {
        @property({id: true})
        id: number;

        @belongsTo(() => Category)
        categoryId: number;
      }

      @model()
      class Category extends Entity {
        @property({id: true})
        id: number;

        @hasMany(() => Product)
        products?: Product[];
      }

      const cachedSchema: JsonSchema = {
        definitions: {
          ProductWithRelations: {
            title: 'ProductWithRelations',
            properties: {
              id: {type: 'number'},
              categoryId: {type: 'number'},
              category: {$ref: '#/definitions/CategoryWithRelations'},
            },
            additionalProperties: false,
          },
        },
        properties: {
          id: {type: 'number'},
          cachedProp: {type: 'string'},
          products: {
            type: 'array',
            items: {$ref: '#/definitions/ProductWithRelations'},
          },
        },
        additionalProperties: false,
        title: 'CategoryWithRelations',
      };
      MetadataInspector.defineMetadata(
        JSON_SCHEMA_KEY,
        {[MODEL_TYPE_KEYS.ModelWithRelations]: cachedSchema},
        Category,
      );
      const jsonSchema = getJsonSchema(Category, {includeRelations: true});
      expect(jsonSchema).to.eql(cachedSchema);
    });

    it('updates same cache with new key if one exists for model', () => {
      @model()
      class Product extends Entity {
        @property({id: true})
        id: number;

        @belongsTo(() => Category)
        categoryId: number;
      }

      @model()
      class Category extends Entity {
        @property({id: true})
        id: number;

        @hasMany(() => Product)
        products?: Product[];
      }

      const cachedSchema: JsonSchema = {
        definitions: {
          ProductWithRelations: {
            title: 'ProductWithRelations',
            properties: {
              id: {type: 'number'},
              categoryId: {type: 'number'},
              category: {$ref: '#/definitions/CategoryWithRelations'},
            },
            additionalProperties: false,
          },
        },
        properties: {
          id: {type: 'number'},
          cachedProp: {type: 'string'},
          products: {
            type: 'array',
            items: {$ref: '#/definitions/ProductWithRelations'},
          },
        },
        additionalProperties: false,
        title: 'CategoryWithRelations',
      };
      MetadataInspector.defineMetadata(
        JSON_SCHEMA_KEY,
        {[MODEL_TYPE_KEYS.ModelWithRelations]: cachedSchema},
        Category,
      );
      const jsonSchema = getJsonSchema(Category);
      // Make sure it's not pulling the withrelations key
      expect(jsonSchema).to.not.eql(cachedSchema);
      expect(jsonSchema).to.eql({
        properties: {
          id: {type: 'number'},
        },
        additionalProperties: false,
        title: 'Category',
      });
    });

    it('emits all properties as optional when the option "partial" is set', () => {
      @model()
      class Product extends Entity {
        @property({id: true, required: true})
        id: number;

        @property({required: true})
        name: string;

        @property()
        optionalDescription: string;
      }

      const originalSchema = getJsonSchema(Product);
      expect(originalSchema.required).to.deepEqual(['id', 'name']);
      expect(originalSchema.title).to.equal('Product');

      const partialSchema = getJsonSchema(Product, {partial: true});
      expect(partialSchema.required).to.equal(undefined);
      expect(partialSchema.title).to.equal('ProductPartial');
    });

    context('exclude properties when option "exclude" is set', () => {
      @model()
      class Product extends Entity {
        @property({id: true, required: true})
        id: number;

        @property()
        name: string;

        @property()
        description: string;
      }

      it('excludes one property when the option "exclude" is set to exclude one property', () => {
        const originalSchema = getJsonSchema(Product);
        expect(originalSchema.properties).to.deepEqual({
          id: {type: 'number'},
          name: {type: 'string'},
          description: {type: 'string'},
        });
        expect(originalSchema.title).to.equal('Product');

        const excludeIdSchema = getJsonSchema(Product, {exclude: ['id']});
        expect(excludeIdSchema).to.deepEqual({
          title: 'ProductExcluding_id_',
          properties: {
            name: {type: 'string'},
            description: {type: 'string'},
          },
          additionalProperties: false,
          description: `(Schema options: { exclude: [ 'id' ] })`,
        });
      });

      it('excludes multiple properties when the option "exclude" is set to exclude multiple properties', () => {
        const originalSchema = getJsonSchema(Product);
        expect(originalSchema.properties).to.deepEqual({
          id: {type: 'number'},
          name: {type: 'string'},
          description: {type: 'string'},
        });
        expect(originalSchema.title).to.equal('Product');

        const excludeIdAndNameSchema = getJsonSchema(Product, {
          exclude: ['id', 'name'],
        });
        expect(excludeIdAndNameSchema).to.deepEqual({
          title: 'ProductExcluding_id-name_',
          properties: {
            description: {type: 'string'},
          },
          additionalProperties: false,
          description: `(Schema options: { exclude: [ 'id', 'name' ] })`,
        });
      });

      it(`doesn't exclude properties when the option "exclude" is set to exclude no properties`, () => {
        const originalSchema = getJsonSchema(Product);
        expect(originalSchema.properties).to.deepEqual({
          id: {type: 'number'},
          name: {type: 'string'},
          description: {type: 'string'},
        });
        expect(originalSchema.title).to.equal('Product');

        const excludeNothingSchema = getJsonSchema(Product, {exclude: []});
        expect(excludeNothingSchema.properties).to.deepEqual({
          id: {type: 'number'},
          name: {type: 'string'},
          description: {type: 'string'},
        });
        expect(excludeNothingSchema.title).to.equal('Product');
      });
    });

    context('optional properties when option "optional" is set', () => {
      @model()
      class Product extends Entity {
        @property({id: true, required: true})
        id: number;

        @property({required: true})
        name: string;

        @property()
        description: string;
      }

      it('makes one property optional when the option "optional" includes one property', () => {
        const originalSchema = getJsonSchema(Product);
        expect(originalSchema.required).to.deepEqual(['id', 'name']);
        expect(originalSchema.title).to.equal('Product');

        const optionalIdSchema = getJsonSchema(Product, {optional: ['id']});
        expect(optionalIdSchema.required).to.deepEqual(['name']);
        expect(optionalIdSchema.title).to.equal('ProductOptional_id_');
        expect(optionalIdSchema.description).to.endWith(
          `(Schema options: { optional: [ 'id' ] })`,
        );
      });

      it('makes multiple properties optional when the option "optional" includes multiple properties', () => {
        const originalSchema = getJsonSchema(Product);
        expect(originalSchema.required).to.deepEqual(['id', 'name']);
        expect(originalSchema.title).to.equal('Product');

        const optionalIdAndNameSchema = getJsonSchema(Product, {
          optional: ['id', 'name'],
        });
        expect(optionalIdAndNameSchema.required).to.equal(undefined);
        expect(optionalIdAndNameSchema.title).to.equal(
          'ProductOptional_id-name_',
        );
        expect(optionalIdAndNameSchema.description).to.endWith(
          `(Schema options: { optional: [ 'id', 'name' ] })`,
        );
      });

      it(`doesn't make properties optional when the option "optional" includes no properties`, () => {
        const originalSchema = getJsonSchema(Product);
        expect(originalSchema.required).to.deepEqual(['id', 'name']);
        expect(originalSchema.title).to.equal('Product');

        const optionalNothingSchema = getJsonSchema(Product, {optional: []});
        expect(optionalNothingSchema.required).to.deepEqual(['id', 'name']);
        expect(optionalNothingSchema.title).to.equal('Product');
      });

      it('overrides "partial" option when "optional" option is set', () => {
        const originalSchema = getJsonSchema(Product);
        expect(originalSchema.required).to.deepEqual(['id', 'name']);
        expect(originalSchema.title).to.equal('Product');

        let optionalNameSchema = getJsonSchema(Product, {
          partial: true,
          optional: ['name'],
        });
        expect(optionalNameSchema.required).to.deepEqual(['id']);
        expect(optionalNameSchema.title).to.equal('ProductOptional_name_');
        expect(optionalNameSchema.description).to.endWith(
          `(Schema options: { optional: [ 'name' ] })`,
        );

        optionalNameSchema = getJsonSchema(Product, {
          partial: false,
          optional: ['name'],
        });
        expect(optionalNameSchema.required).to.deepEqual(['id']);
        expect(optionalNameSchema.title).to.equal('ProductOptional_name_');
        expect(optionalNameSchema.description).to.endWith(
          `(Schema options: { optional: [ 'name' ] })`,
        );
      });

      it('uses "partial" option, if provided, when "optional" option is set but empty', () => {
        const originalSchema = getJsonSchema(Product);
        expect(originalSchema.required).to.deepEqual(['id', 'name']);
        expect(originalSchema.title).to.equal('Product');

        const optionalNameSchema = getJsonSchema(Product, {
          partial: true,
          optional: [],
        });
        expect(optionalNameSchema.required).to.equal(undefined);
        expect(optionalNameSchema.title).to.equal('ProductPartial');
      });

      it('can work with "optional" and "exclude" options together', () => {
        const originalSchema = getJsonSchema(Product);
        expect(originalSchema.required).to.deepEqual(['id', 'name']);
        expect(originalSchema.title).to.equal('Product');

        const bothOptionsSchema = getJsonSchema(Product, {
          exclude: ['id'],
          optional: ['name'],
        });
        expect(bothOptionsSchema.title).to.equal(
          'ProductOptional_name_Excluding_id_',
        );
        expect(bothOptionsSchema.description).to.endWith(
          `(Schema options: { exclude: [ 'id' ], optional: [ 'name' ] })`,
        );
      });
    });

    it('creates new cache entry for each custom title', () => {
      @model()
      class TestModel {}

      // populate the cache
      getJsonSchema(TestModel, {title: 'First'});
      getJsonSchema(TestModel, {title: 'Second'});

      // obtain cached instances & verify the title
      const schema1 = getJsonSchema(TestModel, {title: 'First'});
      expect(schema1.title).to.equal('First');

      const schema2 = getJsonSchema(TestModel, {title: 'Second'});
      expect(schema2.title).to.equal('Second');
    });
  });
});
