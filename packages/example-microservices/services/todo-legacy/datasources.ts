export const datasources: DataSourceConfig = {
  ds: {
    name: 'ds',
    connector: 'mysql',
    host: 'localhost',
    port: 3306,
    database: 'testdb',
    password: 'pass',
    user: 'root',
  }
 };

export interface DataSourceConfig {
  [datasource: string]: DataSourceDefinition
}

/**
 * The parameters required to define a MySQL datasource.
 * 
 * @export
 * @interface DataSourceDefinition
 */
export interface DataSourceDefinition {
   /**
   * The name of the connection (for programmatic reference).
   * 
   * @type {string}
   * @memberof DataSourceDefinition
   */
  name: string;
  /**
   * The identifying name of the legacy connector module used to interact with
   * the datasource.
   * (ex. "mysql", "mongodb", "db2", etc...) 
   * 
   * @type {string}
   * @memberof DataSourceDefinition
   */
  connector: string;
  /**
   * 
   * The accessible machine name, domain address or IP address of the
   * datasource.
   * @type {string}
   * @memberof DataSourceDefinition
   */
  host: string;
  /**
   * The port number on which the datasource is listening for connections.
   * 
   * @type {number}
   * @memberof DataSourceDefinition
   */
  port: number;
  // Allow arbitrary extension of object.
  [extras: string]: any;
}
