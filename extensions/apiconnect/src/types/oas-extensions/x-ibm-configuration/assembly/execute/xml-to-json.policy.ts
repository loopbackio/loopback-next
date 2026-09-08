export type XMLToJSONPolicy = DataPowerGateway | DataPowerAPIGateway;

export type DataPowerGateway = V100;
export type DataPowerAPIGateway = V200;

export interface V100 {
  version: '1.0.0';
  title: string;
  description?: string;
}

export interface V200 extends Omit<V100, 'version'> {
  version: '2.0.0';
  input?: string;
  output?: string;
  conversionType?: 'badgerFish' | 'apicv5';
}
