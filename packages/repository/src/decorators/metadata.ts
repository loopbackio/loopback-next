// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {InspectionOptions, MetadataInspector} from '@loopback/core';
import {ModelDefinition, RelationDefinitionMap} from '../model';
import {RELATIONS_KEY} from '../relations';
import {
  MODEL_KEY,
  MODEL_PROPERTIES_KEY,
  MODEL_WITH_PROPERTIES_KEY,
  PropertyMap,
} from './model.decorator';

export class ModelMetadataHelper {
  /**
   * A utility function to simplify retrieving metadata from a target model and
   * its properties.
   * @param target - The class from which to retrieve metadata.
   * @param options - An options object for the MetadataInspector to customize
   * the output of the metadata retrieval functions.
   */
  static getModelMetadata(
    target: Function,
    options?: InspectionOptions,
  ): ModelDefinition | {} {
    const classDef = MetadataInspector.getClassMetadata(
      MODEL_WITH_PROPERTIES_KEY,
      target,
      // https://github.com/loopbackio/loopback-next/issues/4721
      // The `target` can be a subclass for a base model
      {...options, ownMetadataOnly: true},
    );
    // Return the cached value, if it exists.
    // XXX(kjdelisle): If we're going to support dynamic updates, then this
    // will be problematic in the future, since it will never update.
    if (classDef) {
      return classDef;
    } else {
      const modelMeta = MetadataInspector.getClassMetadata<ModelDefinition>(
        MODEL_KEY,
        target,
        options,
      );
      if (!modelMeta) {
        return {};
      } else {
        // sets the metadata to a dedicated key if cached value does not exist

        // set ModelDefinition properties if they don't already exist
        const meta = new ModelDefinition({...modelMeta});

        // set properties lost from creating instance of ModelDefinition
        Object.assign(meta, modelMeta);

        meta.properties = Object.assign(
          <PropertyMap>meta.properties,
          MetadataInspector.getAllPropertyMetadata(
            MODEL_PROPERTIES_KEY,
            target.prototype,
            options,
          ),
        );

        meta.relations = Object.assign(
          <RelationDefinitionMap>meta.relations,
          MetadataInspector.getAllPropertyMetadata(
            RELATIONS_KEY,
            target.prototype,
            options,
          ),
        );

        MetadataInspector.defineMetadata(
          MODEL_WITH_PROPERTIES_KEY.key,
          meta,
          target,
        );
        return meta;
      }
    }
  }
}
