import {
  DataPowerAPIGateway as ExecuteDataPowerAPIGateway,
  DataPowerGateway as ExecuteDataPowerGateway,
  Execute,
  V100 as ExecuteV100,
  V100Min,
  V200 as ExecuteV200,
  V200Min,
} from '.';

export type SwitchPolicy = DataPowerGateway | DataPowerAPIGateway;

export type DataPowerGateway<ET extends V100Min = ExecuteDataPowerGateway> =
  ET extends Execute ? V100<ET> : V100;
export type DataPowerAPIGateway<
  ET extends V200Min = ExecuteDataPowerAPIGateway,
> = ET extends Execute ? V200<ET> : V200;

export interface V100<ET extends V100Min = ExecuteV100> {
  version: '1.0.0';
  title?: string;
  description?: string;
  case: {
    condition: string;
    execute: ET;
  }[];
}

export interface V200<ET extends V200Min = ExecuteV200>
  extends Omit<V100, 'version' | 'execute'> {
  version: '2.0.0';
  execute: ET;
}
