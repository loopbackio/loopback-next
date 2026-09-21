export type SetVariablePolicy = DataPowerGateway | DataPowerAPIGateway;
export type DataPowerGateway = V100;
export type DataPowerAPIGateway = V200;

export interface V100 {
  version: '1.0.0';
  title?: string;
  description?: string;
  actions:
    | {
        set: string;
        value: string;
      }
    | {
        add: string;
        value: string;
      }
    | {
        clear: string;
      };
}

export interface V200 extends Omit<V100, 'version' | 'actions'> {
  version: '2.0.0';
  actions: (
    | ((
        | {
            set: string;
          }
        | {
            add: string;
          }
      ) &
        (
          | {
              value: string;
              type: 'any' | 'string' | 'number';
            }
          | {
              value: boolean;
              type: 'boolean';
            }
        ))
    | {
        clear: string;
      }
  )[];
}
