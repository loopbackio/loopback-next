// Copyright LoopBack contributors 2022. All Rights Reserved.
// Node module: @loopback/sequelize
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

declare module '@loopback/repository' {
  interface Inclusion {
    /**
     * Setting this option to true will result in an inner join query that
     * explicitly requires the specified condition for the child model.
     *
     * @see https://loopback.io/pages/en/lb4/readmes/loopback-next/extensions/sequelize/#inner-join
     */
    required?: boolean;
  }
}

/**
 * Interface defining the component's options object
 */
export interface LoopbackSequelizeComponentOptions {
  // Add the definitions here
}

/**
 * Default options for the component
 */
export const DEFAULT_LOOPBACK_SEQUELIZE_OPTIONS: LoopbackSequelizeComponentOptions =
  {
    // Specify the values here
  };

/**
 * Sequelize Transaction type
 */
export {Transaction} from 'sequelize';
