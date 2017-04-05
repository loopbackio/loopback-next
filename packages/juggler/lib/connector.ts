import {Model} from './model';

/**
 * Minimum contract for connectors
 */
export interface Connector {
  name: string; // Name/type of the connector
  configModel: Model; // The configuration model
  interfaces: string[]; // A list of interfaces implemented by the connector
  connect(): Promise<any>; // Connect to the underlying system
  disconnect(): Promise<any>; // Disconnect from the underlying system
  ping(): Promise<any>; // Ping the underlying system
}