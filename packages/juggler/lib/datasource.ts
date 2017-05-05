import {Connector} from './connector';

export interface DataSource {
  name: string,
  connector: Connector,
}
