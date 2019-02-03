import {CalculatorDataSource} from '../datasources/calculator.datasource';

export async function givenAConnectedDataSource(): Promise<
  CalculatorDataSource
> {
  const calculatorDataSource = new CalculatorDataSource();
  await calculatorDataSource.connect();
  return calculatorDataSource;
}
