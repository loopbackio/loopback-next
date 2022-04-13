// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, BindingTag} from './binding';
import {BindingAddress} from './binding-key';
import {MapObject} from './value-promise';

/**
 * A function that filters bindings. It returns `true` to select a given
 * binding.
 *
 * @remarks
 * Originally, we allowed filters to be tied with a single value type.
 * This actually does not make much sense - the filter function is typically
 * invoked on all bindings to find those ones matching the given criteria.
 * Filters must be prepared to handle bindings of any value type. We learned
 * about this problem after enabling TypeScript's `strictFunctionTypes` check.
 * This aspect is resolved by typing the input argument as `Binding<unknown>`.
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
 * If we described BindingFilter as a type-guard, then all filter implementations
 * would have to be explicitly typed as type-guards too, which would make it
 * tedious to write quick filter functions like `b => b.key.startsWith('services')`.
 *
 * To keep things simple and easy to use, we use `boolean` as the return type
 * of a binding filter function.
 */
export interface BindingFilter {
  (binding: Readonly<Binding<unknown>>): boolean;
}

/**
 * Select binding(s) by key or a filter function
 */
export type BindingSelector<ValueType = unknown> =
  | BindingAddress<ValueType>
  | BindingFilter;

/**
 * Check if an object is a `BindingKey` by duck typing
 * @param selector Binding selector
 */
function isBindingKey(selector: BindingSelector) {
  if (selector == null || typeof selector !== 'object') return false;
  return (
    typeof selector.key === 'string' &&
    typeof selector.deepProperty === 'function'
  );
}

/**
 * Type guard for binding address
 * @param bindingSelector - Binding key or filter function
 */
export function isBindingAddress(
  bindingSelector: BindingSelector,
): bindingSelector is BindingAddress {
  return (
    typeof bindingSelector !== 'function' &&
    (typeof bindingSelector === 'string' ||
      // See https://github.com/loopbackio/loopback-next/issues/4570
      // `bindingSelector instanceof BindingKey` is not always reliable as the
      // `@loopback/context` module might be loaded from multiple locations if
      // `npm install` does not dedupe or there are mixed versions in the tree
      isBindingKey(bindingSelector))
  );
}

/**
 * Binding filter function that holds a binding tag pattern. `Context.find()`
 * uses the `bindingTagPattern` to optimize the matching of bindings by tag to
 * avoid expensive check for all bindings.
 */
export interface BindingTagFilter extends BindingFilter {
  /**
   * A special property on the filter function to provide access to the binding
   * tag pattern which can be utilized to optimize the matching of bindings by
   * tag in a context.
   */
  bindingTagPattern: BindingTag | RegExp;
}

/**
 * Type guard for BindingTagFilter
 * @param filter - A BindingFilter function
 */
export function isBindingTagFilter(
  filter?: BindingFilter,
): filter is BindingTagFilter {
  if (filter == null || !('bindingTagPattern' in filter)) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagPattern = (filter as any).bindingTagPattern;
  return (
    tagPattern instanceof RegExp ||
    typeof tagPattern === 'string' ||
    typeof tagPattern === 'object'
  );
}

/**
 * A function to check if a given tag value is matched for `filterByTag`
 */
export interface TagValueMatcher {
  /**
   * Check if the given tag value matches the search criteria
   * @param tagValue - Tag value from the binding
   * @param tagName - Tag name
   * @param tagMap - Tag map from the binding
   */
  (tagValue: unknown, tagName: string, tagMap: MapObject<unknown>): boolean;
}

/**
 * A symbol that can be used to match binding tags by name regardless of the
 * value.
 *
 * @example
 *
 * The following code matches bindings with tag `{controller: 'A'}` or
 * `{controller: 'controller'}`. But if the tag name 'controller' does not
 * exist for a binding, the binding will NOT be included.
 *
 * ```ts
 * ctx.findByTag({controller: ANY_TAG_VALUE})
 * ```
 */
export const ANY_TAG_VALUE: TagValueMatcher = (tagValue, tagName, tagMap) =>
  tagName in tagMap;

/**
 * Create a tag value matcher function that returns `true` if the target tag
 * value equals to the item value or is an array that includes the item value.
 * @param itemValues - A list of tag item value
 */
export function includesTagValue(...itemValues: unknown[]): TagValueMatcher {
  return tagValue => {
    return itemValues.some(
      itemValue =>
        // The tag value equals the item value
        tagValue === itemValue ||
        // The tag value contains the item value
        (Array.isArray(tagValue) && tagValue.includes(itemValue)),
    );
  };
}

/**
 * Create a binding filter for the tag pattern
 * @param tagPattern - Binding tag name, regexp, or object
 */
export function filterByTag(tagPattern: BindingTag | RegExp): BindingTagFilter {
  let filter: BindingFilter;
  let regex: RegExp | undefined = undefined;
  if (tagPattern instanceof RegExp) {
    // RegExp for tag names
    regex = tagPattern;
  }
  if (
    typeof tagPattern === 'string' &&
    (tagPattern.includes('*') || tagPattern.includes('?'))
  ) {
    // Wildcard tag name
    regex = wildcardToRegExp(tagPattern);
  }

  if (regex != null) {
    // RegExp or wildcard match
    filter = b => b.tagNames.some(t => regex!.test(t));
  } else if (typeof tagPattern === 'string') {
    // Plain tag string match
    filter = b => b.tagNames.includes(tagPattern);
  } else {
    // Match tag name/value pairs
    const tagMap = tagPattern as MapObject<unknown>;
    filter = b => {
      for (const t in tagMap) {
        if (!matchTagValue(tagMap[t], t, b.tagMap)) return false;
      }
      // All tag name/value pairs match
      return true;
    };
  }
  // Set up binding tag for the filter
  const tagFilter = filter as BindingTagFilter;
  tagFilter.bindingTagPattern = regex ?? tagPattern;
  return tagFilter;
}

function matchTagValue(
  tagValueOrMatcher: unknown,
  tagName: string,
  tagMap: MapObject<unknown>,
) {
  const tagValue = tagMap[tagName];
  if (tagValue === tagValueOrMatcher) return true;

  if (typeof tagValueOrMatcher === 'function') {
    return (tagValueOrMatcher as TagValueMatcher)(tagValue, tagName, tagMap);
  }
  return false;
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
