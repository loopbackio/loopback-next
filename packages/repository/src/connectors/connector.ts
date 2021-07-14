// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AnyObject,
  Command,
  NamedParameters,
  Options,
  PositionalParameters,
} from '../common-types';
import {Model} from '../model';

/**
 * Interfaces adopted by a {@link Connector}.
 *
 * @experimental
 */
export namespace ConnectorInterfaces {
  /**
   * Strong relation interfaces adopted by a {@link Connector}
   *
   * @experimental
   */
  export const enum StrongRelation {
    BELONGS_TO = 'strongBelongsTo',
    HAS_ONE = 'strongHasOne',
    HAS_MANY = 'strongHasMany',
    HAS_MANY_THROUGH = 'strongHasManyThrough',
    HAS_AND_BELONGS_TO_MANY = 'strongHasAndBelongsToMany',
    EMBEDS_ONE = 'strongEmbedsOne',
    EMBEDS_MANY = 'strongEmbedsMany',
    REFERNCES_MANY = 'strongReferencesMany',
  }

  /**
   * Strong query join interfaces adopted by a {@link Connector}
   *
   * @experimental
   */
  export const enum StrongJoins {
    INNER = 'strongInnerJoin',
    LEFT = 'strongLeftJoin',
    RIGHT = 'strongRightJoin',
    FULL = 'strongFullJoin',
    CARTESIAN = 'strongCartesianJoin',
  }
}

/**
 * Common properties/operations for connectors
 */
export interface Connector {
  name: string; // Name/type of the connector
  configModel?: Model; // The configuration model
  interfaces?: (
    | string
    | ConnectorInterfaces.StrongRelation
    | ConnectorInterfaces.StrongJoins
  )[]; // A list of interfaces implemented by the connector
  connect(): Promise<void>; // Connect to the underlying system
  disconnect(): Promise<void>; // Disconnect from the underlying system
  ping(): Promise<void>; // Ping the underlying system
  execute?(
    command: Command,
    parameters: NamedParameters | PositionalParameters,
    options?: Options,
  ): Promise<AnyObject>;
}
