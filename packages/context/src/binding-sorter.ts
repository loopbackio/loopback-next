// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding} from './binding';

/**
 * Compare function to sort an array of bindings.
 * It is used by `Array.prototype.sort()`.
 *
 * @example
 * ```ts
 * const compareByKey: BindingComparator = (a, b) => a.key.localeCompare(b.key);
 * ```
 */
export interface BindingComparator {
  /**
   * Compare two bindings
   * @param bindingA - First binding
   * @param bindingB - Second binding
   * @returns A number to determine order of bindingA and bindingB
   * - 0 leaves bindingA and bindingB unchanged
   * - <0 bindingA comes before bindingB
   * - >0 bindingA comes after bindingB
   */
  (
    bindingA: Readonly<Binding<unknown>>,
    bindingB: Readonly<Binding<unknown>>,
  ): number;
}

/**
 * Creates a binding compare function to sort bindings by tagged phase name.
 *
 * @remarks
 * Two bindings are compared as follows:
 *
 * 1. Get values for the given tag as `phase` for bindings, if the tag is not
 * present, default `phase` to `''`.
 * 2. If both bindings have `phase` value in `orderOfPhases`, honor the order
 * specified by `orderOfPhases`.
 * 3. If a binding's `phase` does not exist in `orderOfPhases`, it comes before
 * the one with `phase` exists in `orderOfPhases`.
 * 4. If both bindings have `phase` value outside of `orderOfPhases`, they are
 * ordered by phase names alphabetically and symbol values come before string
 * values.
 *
 * @param phaseTagName - Name of the binding tag for phase
 * @param orderOfPhases - An array of phase names as the predefined order
 */
export function compareBindingsByTag(
  phaseTagName = 'phase',
  orderOfPhases: (string | symbol)[] = [],
): BindingComparator {
  return (a: Readonly<Binding<unknown>>, b: Readonly<Binding<unknown>>) => {
    return compareByOrder(
      a.tagMap[phaseTagName],
      b.tagMap[phaseTagName],
      orderOfPhases,
    );
  };
}

/**
 * Compare two values by the predefined order
 *
 * @remarks
 *
 * The comparison is performed as follows:
 *
 * 1. If both values are included in `order`, they are sorted by their indexes in
 * `order`.
 * 2. The value included in `order` comes after the value not included in `order`.
 * 3. If neither values are included in `order`, they are sorted:
 *   - symbol values come before string values
 *   - alphabetical order for two symbols or two strings
 *
 * @param a - First value
 * @param b - Second value
 * @param order - An array of values as the predefined order
 */
export function compareByOrder(
  a: string | symbol | undefined | null,
  b: string | symbol | undefined | null,
  order: (string | symbol)[] = [],
) {
  a = a || '';
  b = b || '';
  const i1 = order.indexOf(a);
  const i2 = order.indexOf(b);
  if (i1 !== -1 || i2 !== -1) {
    // Honor the order
    return i1 - i2;
  } else {
    // Neither value is in the pre-defined order

    // symbol comes before string
    if (typeof a === 'symbol' && typeof b === 'string') return -1;
    if (typeof a === 'string' && typeof b === 'symbol') return 1;

    // both a and b are symbols or both a and b are strings
    if (typeof a === 'symbol') a = a.toString();
    if (typeof b === 'symbol') b = b.toString();
    return a < b ? -1 : a > b ? 1 : 0;
  }
}

/**
 * Sort bindings by phase names denoted by a tag and the predefined order
 *
 * @param bindings - An array of bindings
 * @param phaseTagName - Tag name for phase, for example, we can use the value
 * `'a'` of tag `order` as the phase name for `binding.tag({order: 'a'})`.
 *
 * @param orderOfPhases - An array of phase names as the predefined order
 */
export function sortBindingsByPhase<T = unknown>(
  bindings: Readonly<Binding<T>>[],
  phaseTagName?: string,
  orderOfPhases?: (string | symbol)[],
) {
  return bindings.sort(compareBindingsByTag(phaseTagName, orderOfPhases));
}
