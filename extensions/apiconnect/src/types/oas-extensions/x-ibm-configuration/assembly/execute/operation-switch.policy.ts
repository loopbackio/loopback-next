import {
  DataPowerAPIGateway as ExecuteDataPowerAPIGateway,
  DataPowerGateway as ExecuteDataPowerGateway,
  Execute,
  V100Min,
  V200Min,
} from '.';

export type OperationSwitchPolicy = DataPowerGateway | DataPowerAPIGateway;

export type DataPowerGateway<ET extends V100Min = ExecuteDataPowerGateway> =
  V100<ET>;
export type DataPowerAPIGateway<
  ET extends V200Min = ExecuteDataPowerAPIGateway,
> = V200<ET>;

export interface V100<ET extends Execute = V100Min> {
  version: '1.0.0';
  title?: string;
  description?: string;
  case: {
    operations: {
      verb?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH' | 'OPTIONS';
      path?: string;
      operationID?: string;
    };
    execute: ET;
  }[];
}

export interface V200<ET extends Execute = V200Min>
  extends Omit<V100, 'version' | 'execute'> {
  version: '2.0.0';
  execute: ET;
}
