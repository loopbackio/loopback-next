// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/phase
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as util from 'util';

/**
 * Extend the list of builtin phases by merging in an array of phases
 * requested by a user while preserving the relative order of phases
 * as specified by both arrays.
 *
 * If the first new name does not match any existing phase, it is inserted
 * as the first phase in the new list. The same applies for the second phase,
 * and so on, until an existing phase is found.
 *
 * Any new names in the middle of the array are inserted immediatelly after
 * the last common phase. For example, extending
 * `["initial", "session", "auth"]` with `["initial", "preauth", "auth"]`
 * results in `["initial", "preauth", "session", "auth"]`.
 *
 *
 * **Example**
 *
 * ```js
 * const result = mergePhaseNameLists(
 *   ['initial', 'session', 'auth', 'routes', 'files', 'final'],
 *   ['initial', 'postinit', 'preauth', 'auth',
 *     'routes', 'subapps', 'final', 'last']
 * );
 *
 * // result: [
 * //   'initial', 'postinit', 'preauth', 'session', 'auth',
 * //   'routes', 'subapps', 'files', 'final', 'last'
 * // ]
 * ```
 *
 * @param currentNames The current list of phase names.
 * @param namesToMerge The items to add (zip merge) into the target
 *   array.
 * @returns A new array containing combined items from both arrays.
 *
 * @header mergePhaseNameLists
 */
export function mergePhaseNameLists(
  currentNames: string[],
  namesToMerge: string[],
): string[] {
  if (!namesToMerge.length) return currentNames.slice();

  const targetArray = currentNames.slice();
  let targetIx = targetArray.indexOf(namesToMerge[0]);

  if (targetIx === -1) {
    // the first new item does not match any existing one
    // start adding the new items at the start of the list
    targetArray.splice(0, 0, namesToMerge[0]);
    targetIx = 0;
  }

  // merge (zip) two arrays
  for (let sourceIx = 1; sourceIx < namesToMerge.length; sourceIx++) {
    const valueToAdd = namesToMerge[sourceIx];
    const previousValue = namesToMerge[sourceIx - 1];
    const existingIx = targetArray.indexOf(valueToAdd, targetIx);

    if (existingIx === -1) {
      // A new phase - try to add it after the last one,
      // unless it was already registered
      if (targetArray.indexOf(valueToAdd) !== -1) {
        throw new Error(
          util.format(
            'Ordering conflict: cannot add "%s' +
              '" after "%s", because the opposite order was ' +
              ' already specified',
            valueToAdd,
            previousValue,
          ),
        );
      }
      const previousIx = targetArray.indexOf(previousValue);
      targetArray.splice(previousIx + 1, 0, valueToAdd);
    } else {
      // An existing phase - move the pointer
      targetIx = existingIx;
    }
  }

  return targetArray;
}
