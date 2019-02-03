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
    const response = await calculatorService.Add(<CalculatorParameters>{
      intA: 50,
      intB: 2,
    });
    expect(response.result.AddResult).to.deepEqual(52);
  });

  it('subtracts two numbers', async () => {
    const response = await calculatorService.Subtract(<CalculatorParameters>{
      intA: 40,
      intB: 20,
    });
    expect(response.result.SubtractResult).to.deepEqual(20);
  });

  it('multiplies two numbers', async () => {
    const response = await calculatorService.Multiply(<CalculatorParameters>{
      intA: 50,
      intB: 2,
    });
    expect(response.result.MultiplyResult).to.deepEqual(100);
  });

  it('divides two numbers', async () => {
    const response = await calculatorService.Divide(<CalculatorParameters>{
      intA: 100,
      intB: 4,
    });
    expect(response.result.DivideResult).to.deepEqual(25);
  });

  async function givenACalculatorService() {
    let calculatorDataSource = await givenAConnectedDataSource();
    calculatorService = await new CalculatorServiceProvider(
      calculatorDataSource,
    ).value();
  }
});
