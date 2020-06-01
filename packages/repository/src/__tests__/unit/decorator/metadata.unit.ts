// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {
  model,
  ModelDefinition,
  ModelMetadataHelper,
  MODEL_KEY,
  MODEL_WITH_PROPERTIES_KEY,
  property,
} from '../../..';

describe('Repository', () => {
  describe('getAllClassMetadata', () => {
    class Oops {
      @property()
      oopsie: string;
    }

    @model()
    class Colour {
      @property({})
      rgb: string;
    }
    @model()
    class Widget {
      @property()
      id: number;
      @property.array(Colour)
      colours: Colour[];
    }

    @model()
    class Samoflange {
      id: number;
      name: string;
      canRotate: boolean;
    }

    @model()
    class Phlange {
      @property()
      id: number;
      @property()
      canFlap: boolean;
      @property.array(Colour)
      colours: Colour[];
    }

    it('returns empty object for classes without @model', () => {
      const meta = ModelMetadataHelper.getModelMetadata(Oops);
      expect(meta).to.deepEqual({});
    });

    it('retrieves metadata for classes with @model', () => {
      const meta = ModelMetadataHelper.getModelMetadata(Samoflange);
      expect(meta).to.deepEqual(
        new ModelDefinition({
          name: 'Samoflange',
          properties: {},
          settings: new Map(),
        }),
      );
    });

    it('retrieves metadata for classes with @model and @property', () => {
      const meta = ModelMetadataHelper.getModelMetadata(Widget);
      expect(meta).to.deepEqual(
        new ModelDefinition({
          properties: {
            id: {
              type: Number,
            },
            colours: {
              type: Array,
              itemType: Colour,
            },
          },
          settings: new Map(),
          name: 'Widget',
        }),
      );
    });

    it('returns cached metadata instead of recreating it', () => {
      const classMeta = MetadataInspector.getClassMetadata(
        MODEL_KEY,
        Phlange,
      ) as ModelDefinition;
      classMeta.properties = {
        foo: {
          type: String,
        },
      };
      // Intentionally change the metadata to be different from the Phlange
      // class metadata
      MetadataInspector.defineMetadata(
        MODEL_WITH_PROPERTIES_KEY.key,
        classMeta,
        Phlange,
      );

      const meta = ModelMetadataHelper.getModelMetadata(
        Phlange,
      ) as ModelDefinition;
      expect(meta.properties).to.eql(classMeta.properties);
    });
  });
});
