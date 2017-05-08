import {Connector} from './connector';

/**
 * DataSource denotes a configured connector
 */
export interface DataSource {
  name: string, // Name of the data source
  connector: Connector, // The underlying connector
  [property: string]: any; // Other properties that vary by connectors
}
