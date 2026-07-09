// Copyright IBM Corp. and LoopBack contributors 2018,2026. All Rights Reserved.
// Node module: @loopback/example-soap-calculator
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {CalculatorController} from '../../../controllers/calculator.controller';
import {
  AddResponse,
  CalculatorParameters,
  CalculatorService,
  DivideResponse,
  MultiplyResponse,
  SubtractResponse,
} from '../../../services/calculator.service';

describe('CalculatorController (unit)', () => {
  let controller: CalculatorController;
  let calculatorService: CalculatorService;

  beforeEach(givenController);

  describe('multiply', () => {
    it('calls the service with correct parameters', async () => {
      const result = await controller.multiply(5, 3);
      expect(result).to.deepEqual({result: {value: 15}});
    });

    it('handles zero multiplication', async () => {
      const result = await controller.multiply(0, 10);
      expect(result).to.deepEqual({result: {value: 0}});
    });

    it('handles negative numbers', async () => {
      const result = await controller.multiply(-5, 3);
      expect(result).to.deepEqual({result: {value: -15}});
    });

    it('handles large numbers', async () => {
      const result = await controller.multiply(1000, 1000);
      expect(result).to.deepEqual({result: {value: 1000000}});
    });
  });

  describe('add', () => {
    it('calls the service with correct parameters', async () => {
      const result = await controller.add(10, 5);
      expect(result).to.deepEqual({result: {value: 15}});
    });

    it('handles zero addition', async () => {
      const result = await controller.add(0, 0);
      expect(result).to.deepEqual({result: {value: 0}});
    });

    it('handles negative numbers', async () => {
      const result = await controller.add(-5, 3);
      expect(result).to.deepEqual({result: {value: -2}});
    });

    it('handles large numbers', async () => {
      const result = await controller.add(999999, 1);
      expect(result).to.deepEqual({result: {value: 1000000}});
    });
  });

  describe('subtract', () => {
    it('calls the service with correct parameters', async () => {
      const result = await controller.subtract(10, 5);
      expect(result).to.deepEqual({result: {value: 5}});
    });

    it('handles zero subtraction', async () => {
      const result = await controller.subtract(10, 0);
      expect(result).to.deepEqual({result: {value: 10}});
    });

    it('handles negative results', async () => {
      const result = await controller.subtract(5, 10);
      expect(result).to.deepEqual({result: {value: -5}});
    });

    it('handles negative numbers', async () => {
      const result = await controller.subtract(-5, -3);
      expect(result).to.deepEqual({result: {value: -2}});
    });
  });

  describe('divide', () => {
    it('calls the service with correct parameters', async () => {
      const result = await controller.divide(10, 2);
      expect(result).to.deepEqual({result: {value: 5}});
    });

    it('throws error when dividing by zero', async () => {
      await expect(controller.divide(10, 0)).to.be.rejectedWith(
        /Cannot divide by zero/,
      );
    });

    it('handles division resulting in decimal', async () => {
      const result = await controller.divide(10, 3);
      expect(result.result.value).to.be.approximately(3.33, 0.01);
    });

    it('handles negative numbers', async () => {
      const result = await controller.divide(-10, 2);
      expect(result).to.deepEqual({result: {value: -5}});
    });

    it('handles division by one', async () => {
      const result = await controller.divide(42, 1);
      expect(result).to.deepEqual({result: {value: 42}});
    });

    it('handles division of zero', async () => {
      const result = await controller.divide(0, 5);
      expect(result).to.deepEqual({result: {value: 0}});
    });
  });

  describe('edge cases', () => {
    it('multiply handles very small numbers', async () => {
      const result = await controller.multiply(1, 1);
      expect(result).to.deepEqual({result: {value: 1}});
    });

    it('add handles same numbers', async () => {
      const result = await controller.add(7, 7);
      expect(result).to.deepEqual({result: {value: 14}});
    });

    it('subtract results in zero', async () => {
      const result = await controller.subtract(5, 5);
      expect(result).to.deepEqual({result: {value: 0}});
    });

    it('divide handles equal numbers', async () => {
      const result = await controller.divide(8, 8);
      expect(result).to.deepEqual({result: {value: 1}});
    });
  });

  function givenController() {
    calculatorService = givenCalculatorService();
    controller = new CalculatorController(calculatorService);
  }

  function givenCalculatorService(): CalculatorService {
    return {
      async multiply(args: CalculatorParameters): Promise<MultiplyResponse> {
        return {result: {value: args.intA * args.intB}};
      },
      async add(args: CalculatorParameters): Promise<AddResponse> {
        return {result: {value: args.intA + args.intB}};
      },
      async subtract(args: CalculatorParameters): Promise<SubtractResponse> {
        return {result: {value: args.intA - args.intB}};
      },
      async divide(args: CalculatorParameters): Promise<DivideResponse> {
        return {result: {value: args.intA / args.intB}};
      },
    };
  }
});

// Made with Bob
