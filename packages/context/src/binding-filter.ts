// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, BindingTag} from './binding';
import {BindingAddress} from './binding-key';

/**
 * A function that filters bindings. It returns `true` to select a given
 * binding.
 *
 * @remarks
 * TODO(semver-major): We might change this type in the future to either remove
 * the `<ValueType>` or make it as type guard by asserting the matched binding
 * to be typed with `<ValueType>`.
 *
 * **NOTE**: Originally, we allow filters to be tied with a single value type.
 * This actually does not make much sense - the filter function is typically
 * invoked on all bindings to find those ones matching the given criteria.
 * Filters must be prepared to handle bindings of any value type. We learned
 * about this problem after enabling TypeScript's `strictFunctionTypes` check,
 * but decided to preserve `ValueType` argument for backwards compatibility.
 * The `<ValueType>` represents the value type for matched bindings but it's
 * not used for checking.
 *
 * Ideally, `BindingFilter` should be declared as a type guard as follows:
 * ```ts
 * export type BindingFilterGuard<ValueType = unknown> = (
 *   binding: Readonly<Binding<unknown>>,
 * ) => binding is Readonly<Binding<ValueType>>;
 * ```
 *
 * But TypeScript treats the following types as incompatible and does not accept
 * type 1 for type 2.
 *
 * 1. `(binding: Readonly<Binding<unknown>>) => boolean`
 * 2. `(binding: Readonly<Binding<unknown>>) => binding is Readonly<Binding<ValueType>>`
 *
 */
export type BindingFilter<ValueType = unknown> = (
  binding: Readonly<Binding<unknown>>,
) => boolean;

/**
 * Select binding(s) by key or a filter function
 */
export type BindingSelector<ValueType = unknown> =
  | BindingAddress<ValueType>
  | BindingFilter<ValueType>;

/**
 * Type guard for binding address
 * @param bindingSelector
 */
export function isBindingAddress(
  bindingSelector: BindingSelector,
): bindingSelector is BindingAddress {
  return typeof bindingSelector !== 'function';
}

/**
 * Create a binding filter for the tag pattern
 * @param tagPattern - Binding tag name, regexp, or object
 */
export function filterByTag(tagPattern: BindingTag | RegExp): BindingFilter {
  if (typeof tagPattern === 'string' || tagPattern instanceof RegExp) {
    const regexp =
      typeof tagPattern === 'string'
        ? wildcardToRegExp(tagPattern)
        : tagPattern;
    return b => Array.from(b.tagNames).some(t => regexp!.test(t));
  } else {
    return b => {
      for (const t in tagPattern) {
        // One tag name/value does not match
        if (b.tagMap[t] !== tagPattern[t]) return false;
      }
      // All tag name/value pairs match
      return true;
    };
  }
}

/**
 * Create a binding filter from key pattern
 * @param keyPattern - Binding key/wildcard, regexp, or a filter function
 */
export function filterByKey(
  keyPattern?: string | RegExp | BindingFilter,
): BindingFilter {
  if (typeof keyPattern === 'string') {
    const regex = wildcardToRegExp(keyPattern);
    return binding => regex.test(binding.key);
  } else if (keyPattern instanceof RegExp) {
    return binding => keyPattern.test(binding.key);
  } else if (typeof keyPattern === 'function') {
    return keyPattern;
  }
  return () => true;
}

/**
 * Convert a wildcard pattern to RegExp
 * @param pattern - A wildcard string with `*` and `?` as special characters.
 * - `*` matches zero or more characters except `.` and `:`
 * - `?` matches exactly one character except `.` and `:`
 */
function wildcardToRegExp(pattern: string): RegExp {
  // Escape reserved chars for RegExp:
  // `- \ ^ $ + . ( ) | { } [ ] :`
  let regexp = pattern.replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|\:]/g, '\\$&');
  // Replace wildcard chars `*` and `?`
  // `*` matches zero or more characters except `.` and `:`
  // `?` matches one character except `.` and `:`
  regexp = regexp.replace(/\*/g, '[^.:]*').replace(/\?/g, '[^.:]');
  return new RegExp(`^${regexp}$`);
}
