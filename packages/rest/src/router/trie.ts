// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {PathParameterValues} from '../types';

/**
 * A Node in the trie
 */
export interface Node<T> {
  /**
   * Key of the node
   */
  key: string;
  /**
   * Value of the node
   */
  value?: T;
  /**
   * Children of the node
   */
  readonly children: {[key: string]: Node<T>};

  /**
   * Regular expression for the template
   */
  regexp?: RegExp;
  /**
   * Names of the node if it contains named parameters
   */
  names?: string[];
}

export type NodeWithValue<T> = Node<T> & {value: T};

export interface ResolvedNode<T> {
  node: Node<T>;
  // tslint:disable-next-line:no-any
  params?: PathParameterValues;
}

/**
 * An implementation of trie for routes. The key hierarchy is built with parts
 * of the route path delimited by `/`
 */
export class Trie<T> {
  readonly root: Node<T> = {key: '', children: {}};

  /**
   * Create a node for a given path template
   * @param pathTemplate The path template,
   * @param value Value of the route
   */
  create(routeTemplate: string, value: T) {
    const keys = routeTemplate.split('/').filter(Boolean);
    return createNode(keys, 0, value, this.root);
  }

  /**
   * Match a route path against the trie
   * @param path The route path, such as `/customers/c01`
   */
  match(
    path: string,
  ): (ResolvedNode<T> & {node: NodeWithValue<T>}) | undefined {
    const keys = path.split('/').filter(Boolean);
    const params = {};
    const resolved = search(keys, 0, params, this.root);
    if (resolved == null || !isNodeWithValue(resolved.node)) return undefined;
    return {
      node: resolved.node,
      params: resolved.params,
    };
  }

  /**
   * List all nodes with value of the trie
   */
  list(): NodeWithValue<T>[] {
    const nodes: NodeWithValue<T>[] = [];
    traverse(this.root, node => {
      nodes.push(node);
    });
    return nodes;
  }
}

function isNodeWithValue<T>(node: Node<T>): node is NodeWithValue<T> {
  return node.value != null;
}

/**
 * Use depth-first preorder traversal to list all nodes with values
 * @param root Root node
 * @param visitor A function to process nodes with values
 */
function traverse<T>(root: Node<T>, visitor: (node: NodeWithValue<T>) => void) {
  if (isNodeWithValue(root)) visitor(root);
  for (const k in root.children) {
    traverse(root.children[k], visitor);
  }
}

/**
 * Match the given key to a child of the parent node
 * @param key Key
 * @param parent Parent node
 */
function matchChild<T>(
  key: string,
  parent: Node<T>,
): ResolvedNode<T> | undefined {
  // Match key literal first
  let child = parent.children[key];
  if (child) {
    return {
      node: child,
    };
  }

  // Match templates
  for (const k in parent.children) {
    child = parent.children[k];
    if (!child.names || !child.regexp) continue;
    const match = child.regexp.exec(key);
    if (match) {
      const resolved: ResolvedNode<T> = {params: {}, node: child};
      let i = 0;
      for (const n of child.names) {
        const val = match[++i];
        resolved.params![n] = decodeURIComponent(val);
      }
      return resolved;
    }
  }
}

/**
 * Search a sub list of keys against the parent node
 * @param keys An array of keys
 * @param index Starting index of the key list
 * @param params An object to receive resolved parameter values
 * @param parent Parent node
 */
function search<T>(
  keys: string[],
  index: number,
  // tslint:disable-next-line:no-any
  params: {[name: string]: any},
  parent: Node<T>,
): ResolvedNode<T> | undefined {
  const key = keys[index];
  const resolved: ResolvedNode<T> = {node: parent, params};
  if (key === undefined) return resolved;

  const child = matchChild(key, parent);
  if (child) {
    Object.assign(params, child.params);
    return search(keys, index + 1, params, child.node);
  }
  // no matches found
  return undefined;
}

/**
 * Create a node for a sub list of keys against the parent node
 * @param keys An array of keys
 * @param index Starting index of the key list
 * @param value Value of the node
 * @param parent Parent node
 */
function createNode<T>(
  keys: string[],
  index: number,
  value: T,
  parent: Node<T>,
): Node<T> {
  const key = keys[index];
  if (key === undefined) return parent;

  const isLast = keys.length - 1 === index;
  let child = parent.children[key];
  if (child != null) {
    // Found an existing node
    if (isLast) {
      if (child.value == null) {
        child.value = value;
      } else {
        if (child.value !== value) {
          throw new Error(
            'Duplicate key found with different value: ' + keys.join('/'),
          );
        }
      }
    }
    return createNode(keys, index + 1, value, child);
  }

  /**
   * Build a new node
   */
  child = {
    children: {},
    key: key,
  };

  if (isLast) {
    child.value = value;
  }

  // Check if the key has variables such as `{var}`
  const pattern = /\{([^\{]*)\}/g;
  const names: string[] = [];
  let match;
  while ((match = pattern.exec(key))) {
    names.push(match[1]);
  }

  if (names.length) {
    child.names = names;
    const re = '^' + key.replace(/\{([^\}]+)\}/g, '(.+)') + '$';
    child.regexp = new RegExp(re);
  }

  // Add the node to the parent
  parent.children[key] = child;

  // Create nodes for rest of the keys
  return createNode(keys, index + 1, value, child);
}
