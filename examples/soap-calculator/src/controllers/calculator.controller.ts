// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-soap-calculator
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {get, param, HttpErrors} from '@loopback/rest';

import {
  CalculatorService,
  CalculatorParameters,
  AddResponse,
  MultiplyResponse,
  DivideResponse,
  SubtractResponse,
} from '../services/calculator.service';

export class CalculatorController {
  constructor(
    @inject('services.CalculatorService')
    protected calculatorService: CalculatorService,
  ) {}

  @get('/multiply/{intA}/{intB}')
  async multiply(
    @param.path.integer('intA') intA: number,
    @param.path.integer('intB') intB: number,
  ): Promise<MultiplyResponse> {
    return await this.calculatorService.multiply(<CalculatorParameters>{
      intA,
      intB,
    });
  }
  @get('/add/{intA}/{intB}')
  async add(
    @param.path.integer('intA') intA: number,
    @param.path.integer('intB') intB: number,
  ): Promise<AddResponse> {
    return await this.calculatorService.add(<CalculatorParameters>{
      intA,
      intB,
    });
  }

  @get('/subtract/{intA}/{intB}')
  async subtract(
    @param.path.integer('intA') intA: number,
    @param.path.integer('intB') intB: number,
  ): Promise<SubtractResponse> {
    return await this.calculatorService.subtract(<CalculatorParameters>{
      intA,
      intB,
    });
  }

  @get('/divide/{intA}/{intB}')
  async divide(
    @param.path.integer('intA') intA: number,
    @param.path.integer('intB') intB: number,
  ): Promise<DivideResponse> {
    //Preconditions
    if (intB === 0) {
      throw new HttpErrors.PreconditionFailed('Cannot divide by zero');
    }
    return await this.calculatorService.divide(<CalculatorParameters>{
      intA,
      intB,
    });
  }
}
