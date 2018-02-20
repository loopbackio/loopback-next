// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Options, Callback, AnyObject} from './common-types';
import {EventEmitter} from 'events';

// tslint:disable:no-any
// tslint:disable:max-line-length

export declare namespace juggler {
  /**
   * Return type for promisified Node.js async methods.
   *
   * Note that juggler uses Bluebird, not the native Promise.
   */
  export type PromiseOrVoid<T> = PromiseLike<T> | void;

  /**
   * Property definition
   */
  export interface PropertyDefinition extends AnyObject {
    name: string;
    type: any;
  }

  /**
   * Relation definition
   */
  export interface RelationDefinition extends AnyObject {
    name: string;
    type: string;
  }

  /**
   * Schema definition
   */
  export interface Schema {
    name: string;
    properties: AnyObject;
    settings?: AnyObject;
  }

  /**
   * ID definition
   */
  export interface IdDefinition {
    name: string;
    id: number;
    property: AnyObject;
  }

  /**
   * Index definition
   */
  export interface IndexDefinition extends AnyObject {}

  /**
   * Column metadata
   */
  export interface ColumnMetadata extends AnyObject {
    name: string;
  }

  /**
   * Model definition
   */
  export class ModelDefinition extends EventEmitter implements Schema {
    name: string;
    properties: AnyObject;
    rawProperties: AnyObject;
    settings?: AnyObject;
    relations?: AnyObject[];

    constructor(
      modelBuilder: ModelBuilder | null | undefined,
      name: string,
      properties?: {[name: string]: PropertyDefinition},
      settings?: AnyObject,
    );
    constructor(modelBuilder: ModelBuilder | null | undefined, schema: Schema);

    tableName(connectorType: string): string;
    columnName(connectorType: string, propertyName: string): string;
    columnNames(connectorType: string): string[];
    columnMetadata(connectorType: string, propertyName: string): ColumnMetadata;

    ids(): IdDefinition[];
    idName(): string;
    idNames(): string[];

    defineProperty(
      propertyName: string,
      propertyDefinition: PropertyDefinition,
    ): void;
    indexes(): {[name: string]: IndexDefinition};
    build(forceRebuild?: boolean): AnyObject;
    toJSON(forceRebuild?: boolean): AnyObject;
  }

  /**
   * Base model class
   */
  export class ModelBase {
    static dataSource?: DataSource;
    static modelName: string;
    static definition: ModelDefinition;
    static attachTo(ds: DataSource): void;
    constructor(...args: any[]);
    toJSON(): Object;
    toObject(options?: Options): Object;
    [property: string]: any;
  }

  export class ModelBuilder extends EventEmitter {
    static defaultInstance: ModelBuilder;

    models: {[name: string]: typeof ModelBase};
    definitions: {[name: string]: ModelDefinition};
    settings: AnyObject;

    getModel(name: string, forceCreate?: boolean): typeof ModelBase;
    getModelDefinition(name: string): ModelDefinition | undefined;

    define(
      className: string,
      properties?: AnyObject,
      settings?: AnyObject,
      parent?: typeof ModelBase,
    ): typeof ModelBase;

    defineProperty(
      modelName: string,
      propertyName: string,
      propertyDefinition: AnyObject,
    ): void;
    defineValueType(type: string, aliases?: string[]): void;
    extendModel(modelName: string, properties: AnyObject): void;

    getSchemaName(name?: string): string;
    resolveType(type: any): any;
    buildModels(
      schemas: AnyObject,
      createModel?: Function,
    ): {[name: string]: typeof ModelBase};
    buildModelFromInstance(
      name: string,
      json: AnyObject,
      options: Options,
    ): typeof ModelBase;
  }

  /**
   * DataSource instance properties/operations
   */
  export class DataSource {
    name: string;
    settings: AnyObject;

    constructor(
      name?: string,
      settings?: AnyObject,
      modelBuilder?: ModelBuilder,
    );
    constructor(settings?: AnyObject, modelBuilder?: ModelBuilder);

    /**
     * Create a model class
     * @param name Name of the model
     * @param properties An object of property definitions
     * @param options Options for model settings
     */
    createModel<T extends typeof ModelBase>(
      name: string,
      properties?: AnyObject,
      options?: Options,
    ): T;
  }

  /**
   * Union type for model instance or plain object representing the model
   * instance
   */
  export type ModelData<T extends ModelBase> = T | AnyObject;

  /**
   * Operators for where clauses
   */
  export enum Operators {
    eq, // Equal
    neq, // Not Equal
    gt, // >
    gte, // >=
    lt, // <
    lte, // <=
    inq, // IN
    between, // BETWEEN [val1, val2]
    exists,
    and, // AND
    or, // OR
  }

  export interface Condition {
    eq?: any;
    neq?: any;
    gt?: any;
    gte?: any;
    lt?: any;
    lte?: any;
    inq?: any[];
    between?: any[];
    exists?: boolean;
    and?: Where[];
    or?: Where[];
  }

  /**
   * Where object
   */
  export interface Where {
    and?: Where[]; // AND
    or?: Where[]; // OR
    [property: string]: Condition | any; // Other criteria
  }

  /**
   * Selection of fields
   */
  export interface Fields {
    [property: string]: boolean;
  }

  /**
   * Inclusion of related items
   */
  export interface Inclusion {
    relation: string;
    scope?: Filter;
  }

  /**
   * Query filter object
   */
  export interface Filter {
    where?: Where;
    fields?: Fields;
    order?: string[];
    limit?: number;
    skip?: number;
    offset?: number;
    include?: Inclusion[];
  }

  export type PersistedData = ModelData<PersistedModel>;

  export interface Count {
    count: number;
  }

  export class PersistedModel extends ModelBase {
    /**
     * Create new instance of Model, and save to database.
     *
     * @param {Object|Object[]} [data] Optional data argument. Can be either a
     * single model instance or an array of instances.
     *
     * @callback {Function} callback Callback function called with `cb(err, obj)` signature.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} models Model instances or null.
     */
    static create(
      data: PersistedData,
      options?: Options,
      callback?: Callback<PersistedData>,
    ): PromiseOrVoid<PersistedData>;

    /**
     * Update or insert a model instance
     * @param {Object} data The model instance data to insert.
     * @callback {Function} callback Callback function called with `cb(err, obj)` signature.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} model Updated model instance.
     */
    static upsert(
      data: PersistedData,
      options?: Options,
      callback?: Callback<PersistedData>,
    ): PromiseOrVoid<PersistedData>;

    static updateOrCreate(
      data: PersistedData,
      options?: Options,
      callback?: Callback<PersistedData>,
    ): PromiseOrVoid<PersistedData>;

    static patchOrCreate(
      data: PersistedData,
      options?: Options,
      callback?: Callback<PersistedData>,
    ): PromiseOrVoid<PersistedData>;

    /**
     * Update or insert a model instance based on the search criteria.
     * If there is a single instance retrieved, update the retrieved model.
     * Creates a new model if no model instances were found.
     * Returns an error if multiple instances are found.
     * @param {Object} [where]  `where` filter, like
     * ```
     * { key: val, key2: {gt: 'val2'}, ...}
     * ```
     * <br/>see
     * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-other-methods).
     * @param {Object} data The model instance data to insert.
     * @callback {Function} callback Callback function called with `cb(err, obj)` signature.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} model Updated model instance.
     */
    static upsertWithWhere(
      where: Where,
      data: PersistedData,
      options?: Options,
      callback?: Callback<PersistedData>,
    ): PromiseOrVoid<PersistedData>;
    static patchOrCreateWithWhere(
      where: Where,
      data: PersistedData,
      options?: Options,
      callback?: Callback<PersistedData>,
    ): PromiseOrVoid<PersistedData>;

    /**
     * Replace or insert a model instance; replace existing record if one is found,
     * such that parameter `data.id` matches `id` of model instance; otherwise,
     * insert a new record.
     * @param {Object} data The model instance data.
     * @options {Object} [options] Options for replaceOrCreate
     * @property {Boolean} validate Perform validation before saving.  Default is true.
     * @callback {Function} callback Callback function called with `cb(err, obj)` signature.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} model Replaced model instance.
     */
    static replaceOrCreate(
      data: PersistedData,
      options?: Options,
      callback?: Callback<PersistedData>,
    ): PromiseOrVoid<PersistedData>;

    /**
     * Finds one record matching the optional filter object. If not found, creates
     * the object using the data provided as second argument. In this sense it is
     * the same as `find`, but limited to one object. Returns an object, not
     * collection. If you don't provide the filter object argument, it tries to
     * locate an existing object that matches the `data` argument.
     *
     * @options {Object} [filter] Optional Filter object; see below.
     * @property {String|Object|Array} fields Identify fields to include in return result.
     * <br/>See [Fields filter](http://loopback.io/doc/en/lb2/Fields-filter.html).
     * @property {String|Object|Array} include  See PersistedModel.include documentation.
     * <br/>See [Include filter](http://loopback.io/doc/en/lb2/Include-filter.html).
     * @property {Number} limit Maximum number of instances to return.
     * <br/>See [Limit filter](http://loopback.io/doc/en/lb2/Limit-filter.html).
     * @property {String} order Sort order: either "ASC" for ascending or "DESC" for descending.
     * <br/>See [Order filter](http://loopback.io/doc/en/lb2/Order-filter.html).
     * @property {Number} skip Number of results to skip.
     * <br/>See [Skip filter](http://loopback.io/doc/en/lb2/Skip-filter.html).
     * @property {Object} where Where clause, like
     * ```
     * {where: {key: val, key2: {gt: val2}, ...}}
     * ```
     * <br/>See
     * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-queries).
     * @param {Object} data Data to insert if object matching the `where` filter is not found.
     * @callback {Function} callback Callback function called with `cb(err, instance, created)` arguments.  Required.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} instance Model instance matching the `where` filter, if found.
     * @param {Boolean} created True if the instance does not exist and gets created.
     */
    static findOrCreate(
      filter: Filter,
      data: PersistedData,
      options?: Options,
      callback?: Callback<PersistedData>,
    ): PromiseOrVoid<PersistedData>;

    /**
     * Check whether a model instance exists in database.
     *
     * @param {id} id Identifier of object (primary key value).
     *
     * @callback {Function} callback Callback function called with `(err, exists)` arguments.  Required.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Boolean} exists True if the instance with the specified ID exists; false otherwise.
     */
    static exists(
      id: any,
      options?: Options,
      callback?: Callback<boolean>,
    ): PromiseOrVoid<boolean>;

    /**
     * Find object by ID with an optional filter for include/fields.
     *
     * @param {*} id Primary key value
     * @options {Object} [filter] Optional Filter JSON object; see below.
     * @property {String|Object|Array} fields Identify fields to include in return result.
     * <br/>See [Fields filter](http://loopback.io/doc/en/lb2/Fields-filter.html).
     * @property {String|Object|Array} include  See PersistedModel.include documentation.
     * <br/>See [Include filter](http://loopback.io/doc/en/lb2/Include-filter.html).
     * @callback {Function} callback Callback function called with `(err, instance)` arguments.  Required.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} instance Model instance matching the specified ID or null if no instance matches.
     */
    static findById(
      id: any,
      filter?: Filter,
      options?: Options,
      callback?: Callback<boolean>,
    ): PromiseOrVoid<PersistedData>;

    /**
     * Find all model instances that match `filter` specification.
     * See [Querying models](http://loopback.io/doc/en/lb2/Querying-data.html).
     *
     * @options {Object} [filter] Optional Filter JSON object; see below.
     * @property {String|Object|Array} fields Identify fields to include in return result.
     * <br/>See [Fields filter](http://loopback.io/doc/en/lb2/Fields-filter.html).
     * @property {String|Object|Array} include  See PersistedModel.include documentation.
     * <br/>See [Include filter](http://loopback.io/doc/en/lb2/Include-filter.html).
     * @property {Number} limit Maximum number of instances to return.
     * <br/>See [Limit filter](http://loopback.io/doc/en/lb2/Limit-filter.html).
     * @property {String} order Sort order: either "ASC" for ascending or "DESC" for descending.
     * <br/>See [Order filter](http://loopback.io/doc/en/lb2/Order-filter.html).
     * @property {Number} skip Number of results to skip.
     * <br/>See [Skip filter](http://loopback.io/doc/en/lb2/Skip-filter.html).
     * @property {Object} where Where clause, like
     * ```
     * { where: { key: val, key2: {gt: 'val2'}, ...} }
     * ```
     * <br/>See
     * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-queries).
     *
     * @callback {Function} callback Callback function called with `(err, returned-instances)` arguments.    Required.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Array} models Model instances matching the filter, or null if none found.
     */

    static find(
      filter?: Filter,
      options?: Options,
      callback?: Callback<PersistedData>,
    ): PromiseOrVoid<PersistedData[]>;

    /**
     * Find one model instance that matches `filter` specification.
     * Same as `find`, but limited to one result;
     * Returns object, not collection.
     *
     * @options {Object} [filter] Optional Filter JSON object; see below.
     * @property {String|Object|Array} fields Identify fields to include in return result.
     * <br/>See [Fields filter](http://loopback.io/doc/en/lb2/Fields-filter.html).
     * @property {String|Object|Array} include  See PersistedModel.include documentation.
     * <br/>See [Include filter](http://loopback.io/doc/en/lb2/Include-filter.html).
     * @property {String} order Sort order: either "ASC" for ascending or "DESC" for descending.
     * <br/>See [Order filter](http://loopback.io/doc/en/lb2/Order-filter.html).
     * @property {Number} skip Number of results to skip.
     * <br/>See [Skip filter](http://loopback.io/doc/en/lb2/Skip-filter.html).
     * @property {Object} where Where clause, like
     * ```
     * {where: { key: val, key2: {gt: 'val2'}, ...} }
     * ```
     * <br/>See
     * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-queries).
     *
     * @callback {Function} callback Callback function called with `(err, returned-instance)` arguments.  Required.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Array} model First model instance that matches the filter or null if none found.
     */
    static findOne(
      filter?: Filter,
      options?: Options,
      callback?: Callback<PersistedData>,
    ): PromiseOrVoid<PersistedData>;

    /**
     * Destroy all model instances that match the optional `where` specification.
     *
     * @param {Object} [where] Optional where filter, like:
     * ```
     * {key: val, key2: {gt: 'val2'}, ...}
     * ```
     * <br/>See
     * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-other-methods).
     *
     * @callback {Function} callback Optional callback function called with `(err, info)` arguments.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} info Additional information about the command outcome.
     * @param {Number} info.count Number of instances (rows, documents) destroyed.
     */
    static destroyAll(
      where?: Where,
      options?: Options,
      callback?: Callback<Count>,
    ): PromiseOrVoid<Count>;

    static remove(
      where?: Where,
      options?: Options,
      callback?: Callback<Count>,
    ): PromiseOrVoid<Count>;

    static deleteAll(
      where?: Where,
      options?: Options,
      callback?: Callback<Count>,
    ): PromiseOrVoid<Count>;

    /**
     * Update multiple instances that match the where clause.
     *
     * Example:
     *
     *```js
     * Employee.updateAll({managerId: 'x001'}, {managerId: 'x002'}, function(err, info) {
     *     ...
     * });
     * ```
     *
     * @param {Object} [where] Optional `where` filter, like
     * ```
     * { key: val, key2: {gt: 'val2'}, ...}
     * ```
     * <br/>see
     * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-other-methods).
     * @param {Object} data Object containing data to replace matching instances, if AnyType.
     *
     * @callback {Function} callback Callback function called with `(err, info)` arguments.  Required.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} info Additional information about the command outcome.
     * @param {Number} info.count Number of instances (rows, documents) updated.
     *
     */
    static updateAll(
      where?: Where,
      data?: PersistedData,
      options?: Options,
      callback?: Callback<Count>,
    ): PromiseOrVoid<Count>;

    static update(
      where?: Where,
      data?: PersistedData,
      options?: Options,
      callback?: Callback<Count>,
    ): PromiseOrVoid<Count>;

    /**
     * Destroy model instance with the specified ID.
     * @param {*} id The ID value of model instance to delete.
     * @callback {Function} callback Callback function called with `(err)` arguments.  Required.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     */
    static destroyById(
      id: any,
      options?: Options,
      callback?: Callback<Count>,
    ): PromiseOrVoid<Count>;

    static removeById(
      id: any,
      options?: Options,
      callback?: Callback<Count>,
    ): PromiseOrVoid<Count>;

    static deleteById(
      id: any,
      options?: Options,
      callback?: Callback<Count>,
    ): PromiseOrVoid<Count>;

    /**
     * Replace attributes for a model instance whose id is the first input
     * argument and persist it into the datasource.
     * Performs validation before replacing.
     *
     * @param {*} id The ID value of model instance to replace.
     * @param {Object} data Data to replace.
     * @options {Object} [options] Options for replace
     * @property {Boolean} validate Perform validation before saving.  Default is true.
     * @callback {Function} callback Callback function called with `(err, instance)` arguments.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} instance Replaced instance.
     */
    static replaceById(
      id: any,
      data: PersistedData,
      options?: Options,
      callback?: Callback<PersistedData>,
    ): PromiseOrVoid<PersistedData>;

    /**
     * Return the number of records that match the optional "where" filter.
     * @param {Object} [where] Optional where filter, like
     * ```
     * { key: val, key2: {gt: 'val2'}, ...}
     * ```
     * <br/>See
     * [Where filter](http://loopback.io/doc/en/lb2/Where-filter.html#where-clause-for-other-methods).
     * @callback {Function} callback Callback function called with `(err, count)` arguments.  Required.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Number} count Number of instances.
     */
    static count(
      where?: Where,
      options?: Options,
      callback?: Callback<number>,
    ): PromiseOrVoid<number>;

    /**
     * Save model instance. If the instance doesn't have an ID, then calls [create](#persistedmodelcreatedata-cb) instead.
     * Triggers: validate, save, update, or create.
     * @options {Object} [options] See below.
     * @property {Boolean} validate Perform validation before saving.  Default is true.
     * @property {Boolean} throws If true, throw a validation error; WARNING: This can crash Node.
     * If false, report the error via callback.  Default is false.
     * @callback {Function} callback Optional callback function called with `(err, obj)` arguments.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} instance Model instance saved or created.
     */
    save(
      options?: Options,
      callback?: Callback<boolean>,
    ): PromiseOrVoid<boolean>;

    /**
     * Determine if the data model is new.
     * @returns {Boolean} Returns true if the data model is new; false otherwise.
     */
    isNewRecord(): boolean;

    /**
     * Deletes the model from persistence.
     * Triggers `destroy` hook (async) before and after destroying object.
     * @param {Function} callback Callback function.
     */
    destroy(
      options?: Options,
      callback?: Callback<boolean>,
    ): PromiseOrVoid<boolean>;

    remove(
      options?: Options,
      callback?: Callback<boolean>,
    ): PromiseOrVoid<boolean>;

    delete(
      options?: Options,
      callback?: Callback<boolean>,
    ): PromiseOrVoid<boolean>;

    /**
     * Update a single attribute.
     * Equivalent to `updateAttributes({name: 'value'}, cb)`
     *
     * @param {String} name Name of property.
     * @param {Mixed} value Value of property.
     * @callback {Function} callback Callback function called with `(err, instance)` arguments.  Required.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} instance Updated instance.
     */
    updateAttribute(
      name: string,
      value: any,
      options?: Options,
      callback?: Callback<boolean>,
    ): PromiseOrVoid<boolean>;

    /**
     * Update set of attributes.  Performs validation before updating.
     *
     * Triggers: `validation`, `save` and `update` hooks
     * @param {Object} data Data to update.
     * @callback {Function} callback Callback function called with `(err, instance)` arguments.  Required.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} instance Updated instance.
     */
    updateAttributes(
      data: PersistedData,
      options?: Options,
      callback?: Callback<boolean>,
    ): PromiseOrVoid<boolean>;

    /**
     * Replace attributes for a model instance and persist it into the datasource.
     * Performs validation before replacing.
     *
     * @param {Object} data Data to replace.
     * @options {Object} [options] Options for replace
     * @property {Boolean} validate Perform validation before saving.  Default is true.
     * @callback {Function} callback Callback function called with `(err, instance)` arguments.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} instance Replaced instance.
     */
    replaceAttributes(
      data: PersistedData,
      options?: Options,
      callback?: Callback<boolean>,
    ): PromiseOrVoid<boolean>;

    /**
     * Reload object from persistence.  Requires `id` member of `object` to be able to call `find`.
     * @callback {Function} callback Callback function called with `(err, instance)` arguments.  Required.
     * @param {Error} err Error object; see [Error object](http://loopback.io/doc/en/lb2/Error-object.html).
     * @param {Object} instance Model instance.
     */
    reload(
      options?: Options,
      callback?: Callback<PersistedData>,
    ): PromiseOrVoid<PersistedData>;

    /**
     * Set the correct `id` property for the `PersistedModel`. Uses the `setId` method if the model is attached to
     * connector that defines it.  Otherwise, uses the default lookup.
     * Override this method to handle complex IDs.
     *
     * @param {*} val The `id` value. Will be converted to the type that the `id` property specifies.
     */
    setId(val: any): void;

    /**
     * Get the `id` value for the `PersistedModel`.
     *
     * @returns {*} The `id` value
     */

    getId(): any;

    /**
     * Get the `id` property name of the constructor.
     *
     * @returns {String} The `id` property name
     */

    getIdName(): string;

    /**
     * Get the `id` property name of the constructor.
     *
     * @returns {String} The `id` property name
     */
    static getIdName(): string;
  }

  export type KVData = ModelData<KeyValueModel>;
  export class KeyValueModel extends ModelBase {
    /**
     * Return the value associated with a given key.
     *
     * @param {String} key Key to use when searching the database.
     * @options {Object} options
     * @callback {Function} callback
     * @param {Error} err Error object.
     * @param {Any} result Value associated with the given key.
     * @promise
     *
     * @header KeyValueModel.get(key, cb)
     */
    get(
      key: string,
      options?: Options,
      callback?: Callback<KVData>,
    ): PromiseOrVoid<KVData>;

    /**
     * Persist a value and associate it with the given key.
     *
     * @param {String} key Key to associate with the given value.
     * @param {Any} value Value to persist.
     * @options {Number|Object} options Optional settings for the key-value
     *   pair. If a Number is provided, it is set as the TTL (time to live) in ms
     *   (milliseconds) for the key-value pair.
     * @property {Number} ttl TTL for the key-value pair in ms.
     * @callback {Function} callback
     * @param {Error} err Error object.
     * @promise
     *
     * @header KeyValueModel.set(key, value, cb)
     */
    set(
      key: string,
      value: KVData,
      options?: Options,
      callback?: Callback<boolean>,
    ): PromiseOrVoid<boolean>;

    /**
     * Set the TTL (time to live) in ms (milliseconds) for a given key. TTL is the
     * remaining time before a key-value pair is discarded from the database.
     *
     * @param {String} key Key to use when searching the database.
     * @param {Number} ttl TTL in ms to set for the key.
     * @options {Object} options
     * @callback {Function} callback
     * @param {Error} err Error object.
     * @promise
     *
     * @header KeyValueModel.expire(key, ttl, cb)
     */
    expire(
      key: string,
      ttl: number,
      options?: Options,
      callback?: Callback<number>,
    ): PromiseOrVoid<number>;

    /**
     * Return the TTL (time to live) for a given key. TTL is the remaining time
     * before a key-value pair is discarded from the database.
     *
     * @param {String} key Key to use when searching the database.
     * @options {Object} options
     * @callback {Function} callback
     * @param {Error} error
     * @param {Number} ttl Expiration time for the key-value pair. `undefined` if
     *   TTL was not initially set.
     * @promise
     *
     * @header KeyValueModel.ttl(key, cb)
     */
    ttl(
      key: string,
      options?: Options,
      callback?: Callback<number>,
    ): PromiseOrVoid<number>;

    /**
     * Return all keys in the database.
     *
     * **WARNING**: This method is not suitable for large data sets as all
     * key-values pairs are loaded into memory at once. For large data sets,
     * use `iterateKeys()` instead.
     *
     * @param {Object} filter An optional filter object with the following
     * @param {String} filter.match Glob string used to filter returned
     *   keys (i.e. `userid.*`). All connectors are required to support `*` and
     *   `?`, but may also support additional special characters specific to the
     *   database.
     * @param {Object} options
     * @callback {Function} callback
     * @promise
     *
     * @header KeyValueModel.keys(filter, cb)
     */
    keys(
      filter?: Filter,
      options?: Options,
      callback?: Callback<string[]>,
    ): PromiseOrVoid<string[]>;

    /**
     * Asynchronously iterate all keys in the database. Similar to `.keys()` but
     * instead allows for iteration over large data sets without having to load
     * everything into memory at once.
     *
     * Callback example:
     * ```js
     * // Given a model named `Color` with two keys `red` and `blue`
     * var iterator = Color.iterateKeys();
     * it.next(function(err, key) {
     *   // key contains `red`
     *   it.next(function(err, key) {
     *     // key contains `blue`
     *   });
     * });
     * ```
     *
     * Promise example:
     * ```js
     * // Given a model named `Color` with two keys `red` and `blue`
     * var iterator = Color.iterateKeys();
     * Promise.resolve().then(function() {
     *   return it.next();
     * })
     * .then(function(key) {
     *   // key contains `red`
     *   return it.next();
     * });
     * .then(function(key) {
     *   // key contains `blue`
     * });
     * ```
     *
     * @param {Object} filter An optional filter object with the following
     * @param {String} filter.match Glob string to use to filter returned
     *   keys (i.e. `userid.*`). All connectors are required to support `*` and
     *   `?`. They may also support additional special characters that are
     *   specific to the backing database.
     * @param {Object} options
     * @returns {AsyncIterator} An Object implementing `next(cb) -> Promise`
     *   function that can be used to iterate all keys.
     *
     * @header KeyValueModel.iterateKeys(filter)
     */
    iterateKeys(filter?: Filter, options?: Options): Iterator<Promise<string>>;
  }
}
