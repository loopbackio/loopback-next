import {Catch} from '../catch';
import * as Execute from './execute';
import {WebSocketUpgradePolicy} from './execute/websocket-upgrade.policy';

export {Catch, Execute};

export type Assembly = DataPowerGateway | DataPowerAPIGateway;

export interface DataPowerGateway {
  execute?: Execute.DataPowerGateway[];
  catch?: Catch<Execute.DataPowerGateway>[];
}

export interface DataPowerAPIGateway {
  execute?: Execute.DataPowerAPIGateway[];
  catch?: Catch<Execute.DataPowerAPIGateway>[];
  'websocket-upgrade'?: WebSocketUpgradePolicy[];
}
