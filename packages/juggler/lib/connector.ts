/**
 * Minimum contract for connectors
 */
export interface Connector {
  name: string;
  interfaces: string[];
  connect(): Promise<any>;
  disconnect(): Promise<any>;
  ping(): Promise<any>;
}