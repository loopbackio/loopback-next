// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, BindingEventListener, BindingTag} from './binding';
import {BindingFilter, filterByTag} from './binding-filter';
import {Context} from './context';
import {ContextEventListener} from './context-event';
import {BoundValue} from './value-promise';

/**
 * Indexer for context bindings by tag
 */
export class ContextTagIndexer {
  /**
   * Index for bindings by tag names
   */
  readonly bindingsIndexedByTag: Map<string, Set<Readonly<Binding<unknown>>>> =
    new Map();

  /**
   * A listener for binding events
   */
  private bindingEventListener: BindingEventListener;

  /**
   * A listener to maintain tag index for bindings
   */
  private tagIndexListener: ContextEventListener;

  constructor(protected readonly context: Context) {
    this.setupTagIndexForBindings();
  }

  /**
   * Set up context/binding listeners and refresh index for bindings by tag
   */
  private setupTagIndexForBindings() {
    this.bindingEventListener = ({binding, operation}) => {
      if (operation === 'tag') {
        this.updateTagIndexForBinding(binding);
      }
    };
    this.tagIndexListener = event => {
      const {binding, type} = event;
      if (event.context !== this.context) return;
      if (type === 'bind') {
        this.updateTagIndexForBinding(binding);
        binding.on('changed', this.bindingEventListener);
      } else if (type === 'unbind') {
        this.removeTagIndexForBinding(binding);
        binding.removeListener('changed', this.bindingEventListener);
      }
    };
    this.context.on('bind', this.tagIndexListener);
    this.context.on('unbind', this.tagIndexListener);
  }

  /**
   * Remove tag index for the given binding
   * @param binding - Binding object
   */
  private removeTagIndexForBinding(binding: Readonly<Binding<unknown>>) {
    for (const [, bindings] of this.bindingsIndexedByTag) {
      bindings.delete(binding);
    }
  }

  /**
   * Update tag index for the given binding
   * @param binding - Binding object
   */
  private updateTagIndexForBinding(binding: Readonly<Binding<unknown>>) {
    this.removeTagIndexForBinding(binding);
    for (const tag of binding.tagNames) {
      let bindings = this.bindingsIndexedByTag.get(tag);
      if (bindings == null) {
        bindings = new Set();
        this.bindingsIndexedByTag.set(tag, bindings);
      }
      bindings.add(binding);
    }
  }

  /**
   * Find bindings by tag leveraging indexes
   * @param tag - Tag name pattern or name/value pairs
   */
  findByTagIndex<ValueType = BoundValue>(
    tag: BindingTag | RegExp,
  ): Readonly<Binding<ValueType>>[] {
    let tagNames: string[];
    // A flag to control if a union of matched bindings should be created
    let union = false;
    if (tag instanceof RegExp) {
      // For wildcard/regexp, a union of matched bindings is desired
      union = true;
      // Find all matching tag names
      tagNames = [];
      for (const t of this.bindingsIndexedByTag.keys()) {
        if (tag.test(t)) {
          tagNames.push(t);
        }
      }
    } else if (typeof tag === 'string') {
      tagNames = [tag];
    } else {
      tagNames = Object.keys(tag);
    }
    let filter: BindingFilter | undefined;
    let bindings: Set<Readonly<Binding<ValueType>>> | undefined;
    for (const t of tagNames) {
      const bindingsByTag = this.bindingsIndexedByTag.get(t);
      if (bindingsByTag == null) break; // One of the tags is not found
      filter = filter ?? filterByTag(tag);
      const matched = new Set(Array.from(bindingsByTag).filter(filter)) as Set<
        Readonly<Binding<ValueType>>
      >;
      if (!union && matched.size === 0) break; // One of the tag name/value is not found
      if (bindings == null) {
        // First set of bindings matching the tag
        bindings = matched;
      } else {
        if (union) {
          matched.forEach(b => bindings?.add(b));
        } else {
          // Now need to find intersected bindings against visited tags
          const intersection = new Set<Readonly<Binding<ValueType>>>();
          bindings.forEach(b => {
            if (matched.has(b)) {
              intersection.add(b);
            }
          });
          bindings = intersection;
        }
        if (!union && bindings.size === 0) break;
      }
    }
    return bindings == null ? [] : Array.from(bindings);
  }

  close() {
    this.context.removeListener('bind', this.tagIndexListener);
    this.context.removeListener('unbind', this.tagIndexListener);
  }
}
