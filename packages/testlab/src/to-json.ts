// Copyright IBM Corp. and LoopBack contributors 2018,2019. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/* eslint-disable @typescript-eslint/unified-signatures */

// Important! Date.prototype.toJSON() returns a string.
export function toJSON(value: Date): string;

// Important! Functions cannot be encoded in JSON.
export function toJSON(value: Function): undefined;

// Distinguish arrays from objects (an array is an object too)
export function toJSON(value: unknown[]): unknown[];

/**
 * JSON encoding does not preserve properties that are undefined
 * As a result, deepEqual checks fail because the expected model
 * value contains these undefined property values, while the actual
 * result returned by REST API does not.
 * Use this function to convert a model instance into a data object
 * as returned by REST API
 */
export function toJSON(value: object): object;

// The following overloads are provided for convenience.
// In practice, they should not be necessary, as they simply return the input
// value without any modifications.

export function toJSON(value: undefined): undefined;
export function toJSON(value: null): null;
export function toJSON(value: number): number;
export function toJSON(value: boolean): boolean;
export function toJSON(value: string): string;

// The following overloads are required to allow TypesScript handle
// commonly used union types.

export function toJSON(value: unknown[] | null): unknown[] | null;
export function toJSON(value: unknown[] | undefined): unknown[] | undefined;
export function toJSON(
  value: unknown[] | null | undefined,
): unknown[] | null | undefined;

export function toJSON(value: object | null): object | null;
export function toJSON(value: object | undefined): object | undefined;
export function toJSON(
  value: object | null | undefined,
): object | null | undefined;

export function toJSON<T>(value: T) {
  return JSON.parse(JSON.stringify({value})).value;
}
