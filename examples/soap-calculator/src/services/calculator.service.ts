import {getService, juggler} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {CalculatorDataSource} from '../datasources/calculator.datasource';

export interface MultiplyResult {
  result: {
    MultiplyResult: number;
  };
}
export interface AddResult {
  result: {
    AddResult: number;
  };
}
export interface SubtractResult {
  result: {
    SubtractResult: number;
  };
}
export interface DivideResult {
  result: {
    DivideResult: number;
  };
}
export interface CalculatorParameters {
  intA: number;
  intB: number;
}

export interface CalculatorService {
  Multiply(args: CalculatorParameters): Promise<MultiplyResult>;
  Add(args: CalculatorParameters): Promise<AddResult>;
  Divide(args: CalculatorParameters): Promise<DivideResult>;
  Subtract(args: CalculatorParameters): Promise<SubtractResult>;
}

export class CalculatorServiceProvider implements Provider<CalculatorService> {
  constructor(
    @inject('datasources.calculator')
    protected datasource: juggler.DataSource = new CalculatorDataSource(),
  ) {}

  value(): Promise<CalculatorService> {
    return getService(this.datasource);
  }
}
