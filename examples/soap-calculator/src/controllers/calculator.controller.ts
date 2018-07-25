import {inject} from '@loopback/core';
import {get, param, HttpErrors} from '@loopback/rest';

import {
  CalculatorService,
  CalculatorParameters,
  AddResult,
  MultiplyResult,
  DivideResult,
  SubtractResult,
} from '../services/calculator.service';

export class CalculatorController {
  constructor(
    @inject('services.CalculatorService')
    protected calculatorService: CalculatorService,
  ) {}

  @get('/multiply/{arg1}/{arg2}')
  async multiply(
    @param.path.integer('arg1') intA: number,
    @param.path.integer('arg2') intB: number,
  ): Promise<MultiplyResult> {
    return await this.calculatorService.Multiply(<CalculatorParameters>{
      intA,
      intB,
    });
  }
  @get('/add/{arg1}/{arg2}')
  async add(
    @param.path.integer('arg1') intA: number,
    @param.path.integer('arg2') intB: number,
  ): Promise<AddResult> {
    return await this.calculatorService.Add(<CalculatorParameters>{
      intA,
      intB,
    });
  }

  @get('/subtract/{arg1}/{arg2}')
  async subtract(
    @param.path.integer('arg1') intA: number,
    @param.path.integer('arg2') intB: number,
  ): Promise<SubtractResult> {
    return await this.calculatorService.Subtract(<CalculatorParameters>{
      intA,
      intB,
    });
  }

  @get('/divide/{arg1}/{arg2}')
  async divide(
    @param.path.integer('arg1') intA: number,
    @param.path.integer('arg2') intB: number,
  ): Promise<DivideResult> {
    //Preconditions
    if (intB === 0) {
      throw new HttpErrors.PreconditionFailed('Cannot divide by zero');
    }
    return await this.calculatorService.Divide(<CalculatorParameters>{
      intA,
      intB,
    });
  }
}
