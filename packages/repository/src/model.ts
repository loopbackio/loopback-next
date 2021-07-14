// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyObject, DataObject, Options, PrototypeOf} from './common-types';
import {
  BelongsToDefinition,
  HasManyDefinition,
  HasOneDefinition,
  JsonSchema,
  RelationMetadata,
  RelationType,
} from './index';
import {TypeResolver} from './type-resolver';
import {Type} from './types';

/**
 * This module defines the key classes representing building blocks for Domain
 * Driven Design.
 * See https://en.wikipedia.org/wiki/Domain-driven_design#Building_blocks
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface JsonSchemaWithExtensions extends JsonSchema {
  [attributes: string]: any;
}

export type PropertyType =
  | string
  | Function
  | object
  | Type<any>
  | TypeResolver<Model>;

/**
 * Property definition for a model
 */
export interface PropertyDefinition {
  type: PropertyType; // For example, 'string', String, or {}
  id?: boolean | number;
  /**
   * Used to hide this property from the response body,
   * adding this property to the hiddenProperties array
   */
  hidden?: boolean;
  json?: PropertyForm;
  jsonSchema?: JsonSchemaWithExtensions;
  store?: PropertyForm;
  itemType?: PropertyType; // type of array
  [attribute: string]: any; // Other attributes
}

/**
 * Defining the settings for a model
 * See https://loopback.io/doc/en/lb4/Model.html#supported-entries-of-model-definition
 */
export interface ModelSettings {
  /**
   * Description of the model
   */
  description?: string;
  /**
   * Prevent clients from setting the auto-generated ID value manually
   */
  forceId?: boolean;
  /**
   * Hides properties from response bodies
   */
  hiddenProperties?: string[];
  /**
   * Scope enables you to set a scope that will apply to every query made by the model's repository
   */
  scope?: object;
  /**
   * Specifies whether the model accepts only predefined properties or not
   */
  strict?: boolean | 'filter';

  // Other variable settings
  [name: string]: any;
}

/**
 * See https://github.com/loopbackio/loopback-datasource-juggler/issues/432
 */
export interface PropertyForm {
  in?: boolean; // Can the property be used for input
  out?: boolean; // Can the property be used for output
  name?: string; // Custom name for this form
}

/**
 * A key-value map describing model relations.
 * A relation name is used as the key, a relation definition is the value.
 */
export type RelationDefinitionMap = {
  [relationName: string]: RelationMetadata;
};

/**
 * DSL for building a model definition.
 */
export interface ModelDefinitionSyntax {
  name: string;
  properties?: {[name: string]: PropertyDefinition | PropertyType};
  settings?: ModelSettings;
  relations?: RelationDefinitionMap;
  jsonSchema?: JsonSchemaWithExtensions;
  [attribute: string]: any;
}

/**
 * Definition for a model
 */
export class ModelDefinition {
  readonly name: string;
  properties: {[name: string]: PropertyDefinition};
  settings: ModelSettings;
  relations: RelationDefinitionMap;
  // indexes: Map<string, any>;
  [attribute: string]: any; // Other attributes

  constructor(nameOrDef: string | ModelDefinitionSyntax) {
    if (typeof nameOrDef === 'string') {
      nameOrDef = {name: nameOrDef};
    }
    const {name, properties, settings, relations} = nameOrDef;

    this.name = name;

    this.properties = {};
    if (properties) {
      for (const p in properties) {
        this.addProperty(p, properties[p]);
      }
    }

    this.settings = settings ?? new Map();
    this.relations = relations ?? {};
  }

  /**
   * Add a property
   * @param name - Property definition or name (string)
   * @param definitionOrType - Definition or property type
   */
  addProperty(
    name: string,
    definitionOrType: PropertyDefinition | PropertyType,
  ): this {
    const definition = (definitionOrType as PropertyDefinition).type
      ? (definitionOrType as PropertyDefinition)
      : {type: definitionOrType};

    if (
      definition.id === true &&
      definition.generated === true &&
      definition.type !== undefined &&
      definition.useDefaultIdType === undefined
    ) {
      definition.useDefaultIdType = false;
    }

    this.properties[name] = definition;
    return this;
  }

  /**
   * Add a setting
   * @param name - Setting name
   * @param value - Setting value
   */
  addSetting(name: string, value: any): this {
    this.settings[name] = value;
    return this;
  }

  /**
   * Define a new relation.
   * @param definition - The definition of the new relation.
   */
  addRelation(definition: RelationMetadata): this {
    this.relations[definition.name] = definition;
    return this;
  }

  /**
   * Define a new belongsTo relation.
   * @param name - The name of the belongsTo relation.
   * @param definition - The definition of the belongsTo relation.
   */
  belongsTo(
    name: string,
    definition: Omit<BelongsToDefinition, 'name' | 'type' | 'targetsMany'>,
  ): this {
    const meta: BelongsToDefinition = {
      ...definition,
      name,
      type: RelationType.belongsTo,
      targetsMany: false,
    };
    return this.addRelation(meta);
  }

  /**
   * Define a new hasOne relation.
   * @param name - The name of the hasOne relation.
   * @param definition - The definition of the hasOne relation.
   */
  hasOne(
    name: string,
    definition: Omit<HasOneDefinition, 'name' | 'type' | 'targetsMany'>,
  ): this {
    const meta: HasOneDefinition = {
      ...definition,
      name,
      type: RelationType.hasOne,
      targetsMany: false,
    };
    return this.addRelation(meta);
  }

  /**
   * Define a new hasMany relation.
   * @param name - The name of the hasMany relation.
   * @param definition - The definition of the hasMany relation.
   */
  hasMany(
    name: string,
    definition: Omit<HasManyDefinition, 'name' | 'type' | 'targetsMany'>,
  ): this {
    const meta: HasManyDefinition = {
      ...definition,
      name,
      type: RelationType.hasMany,
      targetsMany: true,
    };
    return this.addRelation(meta);
  }

  /**
   * Get an array of names of ID properties, which are specified in
   * the model settings or properties with `id` attribute.
   *
   * @example
   * ```ts
   * {
   *   settings: {
   *     id: ['id']
   *   }
   *   properties: {
   *     id: {
   *       type: 'string',
   *       id: true
   *     }
   *   }
   * }
   * ```
   */
  idProperties(): string[] {
    if (typeof this.settings.id === 'string') {
      return [this.settings.id];
    } else if (Array.isArray(this.settings.id)) {
      return this.settings.id;
    }
    const idProps = Object.keys(this.properties).filter(
      prop => this.properties[prop].id,
    );
    return idProps;
  }
}

function asJSON(value: any): any {
  if (value == null) return value;
  if (typeof value.toJSON === 'function') {
    return value.toJSON();
  }
  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => asJSON(item));
  }
  return value;
}

/**
 * Convert a value to a plain object as DTO.
 *
 * - The prototype of the value in primitive types are preserved,
 *   like `Date`, `ObjectId`.
 * - If the value is an instance of custom model, call `toObject` to convert.
 * - If the value is an array, convert each element recursively.
 *
 * @param value the value to convert
 * @param options the options
 */
function asObject(value: any, options?: Options): any {
  if (value == null) return value;
  if (typeof value.toObject === 'function') {
    return value.toObject(options);
  }
  if (Array.isArray(value)) {
    return value.map(item => asObject(item, options));
  }
  return value;
}

/**
 * Base class for models
 */
export class Model {
  static get modelName(): string {
    return this.definition?.name || this.name;
  }

  static definition: ModelDefinition;

  /**
   * Serialize into a plain JSON object
   */
  toJSON(): Object {
    const def = (this.constructor as typeof Model).definition;
    if (def == null || def.settings.strict === false) {
      return this.toObject({ignoreUnknownProperties: false});
    }

    const copyPropertyAsJson = (key: string) => {
      const val = asJSON((this as AnyObject)[key]);
      if (val !== undefined) {
        json[key] = val;
      }
    };

    const json: AnyObject = {};
    const hiddenProperties: string[] = def.settings.hiddenProperties || [];
    for (const p in def.properties) {
      if (p in this && !hiddenProperties.includes(p)) {
        copyPropertyAsJson(p);
      }
    }

    for (const r in def.relations) {
      const relName = def.relations[r].name;
      if (relName in this) {
        copyPropertyAsJson(relName);
      }
    }

    return json;
  }

  /**
   * Convert to a plain object as DTO
   *
   * If `ignoreUnknownProperty` is set to false, convert all properties in the
   * model instance, otherwise only convert the ones defined in the model
   * definitions.
   *
   * See function `asObject` for each property's conversion rules.
   */
  toObject(options?: Options): Object {
    const def = (this.constructor as typeof Model).definition;
    const obj: AnyObject = {};

    if (options?.ignoreUnknownProperties === false) {
      const hiddenProperties: string[] = def?.settings.hiddenProperties || [];
      for (const p in this) {
        if (!hiddenProperties.includes(p)) {
          const val = (this as AnyObject)[p];
          obj[p] = asObject(val, options);
        }
      }
      return obj;
    }

    if (def?.relations) {
      for (const r in def.relations) {
        const relName = def.relations[r].name;
        if (relName in this) {
          obj[relName] = asObject((this as AnyObject)[relName], {
            ...options,
            ignoreUnknownProperties: false,
          });
        }
      }
    }

    const props = def.properties;
    const keys = Object.keys(props);

    for (const i in keys) {
      const propertyName = keys[i];
      const val = (this as AnyObject)[propertyName];

      if (val === undefined) continue;
      obj[propertyName] = asObject(val, options);
    }

    return obj;
  }

  constructor(data?: DataObject<Model>) {
    Object.assign(this, data);
  }
}

export interface Persistable {
  // isNew: boolean;
}

/**
 * Base class for value objects - An object that contains attributes but has no
 * conceptual identity. They should be treated as immutable.
 */
export abstract class ValueObject extends Model implements Persistable {}

/**
 * Base class for entities which have unique ids
 */
export class Entity extends Model implements Persistable {
  /**
   * Get the names of identity properties (primary keys).
   */
  static getIdProperties(): string[] {
    return this.definition.idProperties();
  }

  /**
   * Get the identity value for a given entity instance or entity data object.
   *
   * @param entityOrData - The data object for which to determine the identity
   * value.
   */
  static getIdOf(entityOrData: AnyObject): any {
    if (typeof entityOrData.getId === 'function') {
      return entityOrData.getId();
    }

    const idName = this.getIdProperties()[0];
    return entityOrData[idName];
  }

  /**
   * Get the identity value. If the identity is a composite key, returns
   * an object.
   */
  getId(): any {
    const definition = (this.constructor as typeof Entity).definition;
    const idProps = definition.idProperties();
    if (idProps.length === 1) {
      return (this as AnyObject)[idProps[0]];
    }
    if (!idProps.length) {
      throw new Error(
        `Invalid Entity ${this.constructor.name}:` +
          'missing primary key (id) property',
      );
    }
    return this.getIdObject();
  }

  /**
   * Get the identity as an object, such as `{id: 1}` or
   * `{schoolId: 1, studentId: 2}`
   */
  getIdObject(): Object {
    const definition = (this.constructor as typeof Entity).definition;
    const idProps = definition.idProperties();
    const idObj = {} as any;
    for (const idProp of idProps) {
      idObj[idProp] = (this as AnyObject)[idProp];
    }
    return idObj;
  }

  /**
   * Build the where object for the given id
   * @param id - The id value
   */
  static buildWhereForId(id: any) {
    const where = {} as any;
    const idProps = this.definition.idProperties();
    if (idProps.length === 1) {
      where[idProps[0]] = id;
    } else {
      for (const idProp of idProps) {
        where[idProp] = id[idProp];
      }
    }
    return where;
  }
}

/**
 * Domain events
 */
export class Event {
  source: any;
  type: string;
}

export type EntityData = DataObject<Entity>;

export type EntityResolver<T extends Entity> = TypeResolver<T, typeof Entity>;

/**
 * Check model data for navigational properties linking to related models.
 * Throw a descriptive error if any such property is found.
 *
 * @param modelClass Model constructor, e.g. `Product`.
 * @param entityData  Model instance or a plain-data object,
 * e.g. `{name: 'pen'}`.
 */
export function rejectNavigationalPropertiesInData<M extends typeof Entity>(
  modelClass: M,
  data: DataObject<PrototypeOf<M>>,
) {
  const def = modelClass.definition;
  const props = def.properties;

  for (const r in def.relations) {
    const relName = def.relations[r].name;
    if (!(relName in data)) continue;

    let msg =
      'Navigational properties are not allowed in model data ' +
      `(model "${modelClass.modelName}" property "${relName}"), ` +
      'please remove it.';

    if (relName in props) {
      msg +=
        ' The error might be invoked by belongsTo relations, please make' +
        ' sure the relation name is not the same as the property name.';
    }

    throw new Error(msg);
  }
}
