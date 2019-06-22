// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-soap-calculator
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CalculatorDataSource} from '../datasources/calculator.datasource';

export async function givenAConnectedDataSource(): Promise<
  CalculatorDataSource
> {
  const calculatorDataSource = new CalculatorDataSource();
  await calculatorDataSource.connect();
  return calculatorDataSource;
}
