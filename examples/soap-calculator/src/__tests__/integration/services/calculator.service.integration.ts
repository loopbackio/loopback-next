// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-soap-calculator
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  CalculatorService,
  CalculatorParameters,
} from '../../../services/calculator.service';
import {CalculatorServiceProvider} from '../../../services/calculator.service';
import {givenAConnectedDataSource} from '../../helpers';

import {expect} from '@loopback/testlab';

describe('CalculatorService', () => {
  let calculatorService: CalculatorService;

  before(givenACalculatorService);

  it('adds two numbers', async () => {
    const response = await calculatorService.add(<CalculatorParameters>{
      intA: 50,
      intB: 2,
    });
    expect(response.result.value).to.deepEqual(52);
  });

  it('subtracts two numbers', async () => {
    const response = await calculatorService.subtract(<CalculatorParameters>{
      intA: 40,
      intB: 20,
    });
    expect(response.result.value).to.deepEqual(20);
  });

  it('multiplies two numbers', async () => {
    const response = await calculatorService.multiply(<CalculatorParameters>{
      intA: 50,
      intB: 2,
    });
    expect(response.result.value).to.deepEqual(100);
  });

  it('divides two numbers', async () => {
    const response = await calculatorService.divide(<CalculatorParameters>{
      intA: 100,
      intB: 4,
    });
    expect(response.result.value).to.deepEqual(25);
  });

  async function givenACalculatorService() {
    let calculatorDataSource = await givenAConnectedDataSource();
    calculatorService = await new CalculatorServiceProvider(
      calculatorDataSource,
    ).value();
  }
});
