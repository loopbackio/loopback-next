// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {InspectionOptions, MetadataInspector} from '@loopback/context';
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
      options,
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
        const meta = new ModelDefinition(Object.assign({}, modelMeta));

        // set properies lost from creating instance of ModelDefinition
        Object.assign(meta, modelMeta);

        meta.properties = Object.assign(
          <PropertyMap>{},
          MetadataInspector.getAllPropertyMetadata(
            MODEL_PROPERTIES_KEY,
            target.prototype,
            options,
          ),
        );

        meta.relations = Object.assign(
          <RelationDefinitionMap>{},
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
