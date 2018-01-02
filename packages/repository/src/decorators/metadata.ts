import {InspectionOptions, MetadataInspector} from '@loopback/context';
import {MODEL_PROPERTIES_KEY, MODEL_WITH_PROPERTIES_KEY} from '../';
import {ModelDefinition, PropertyDefinition} from '../../index';
export class ModelMetadataHelper {
  /**
   * A utility function to simplify retrieving metadata from a target model and
   * its properties.
   * @param target The class from which to retrieve metadata.
   * @param options An options object for the MetadataInspector to customize
   * the output of the metadata retrieval functions.
   */
  static getModelMetadata(target: Function, options?: InspectionOptions) {
    let classDef = MetadataInspector.getClassMetadata(
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
      const meta = new ModelDefinition(
        Object.assign({name: target.name}, classDef),
      );
      meta.properties = Object.assign(
        <PropertyDefinition>{},
        MetadataInspector.getAllPropertyMetadata(
          MODEL_PROPERTIES_KEY,
          target.prototype,
          options,
        ),
      );
      MetadataInspector.defineMetadata(MODEL_WITH_PROPERTIES_KEY, meta, target);
      return meta;
    }
  }
}
