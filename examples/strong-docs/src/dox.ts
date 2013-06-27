// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: string-docs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * https://github.com/tj/dox
 */
/**
 * Context
 *
 * - classes
 * - class constructors
 * - class methods
 * - function statements
 * - function expressions
 * - prototype methods
 * - prototype properties
 * - methods
 * - properties
 * - declarations
 */
export interface Context {
  type: string;
  name: string;
  string: string;

  constructor?: string;
  cons?: string;
  extends?: string;
  value?: string;
  receiver?: string;
}

export interface Description {
  full?: string;
  summary?: string;
  body?: string;
}

/**
 * JSDoc tags
 * - @property
 * - @template
 * - @param
 * - @define
 * - @return
 * - @returns
 * - @see
 * - @api
 * - @public
 * - @private
 * - @protected
 * - @enum
 * - @typedef
 * - @type
 * - @lends
 * - @memberOf
 * - @extends
 * - @implements
 * - @augments
 * - @borrows
 * - @throws
 * - @description
 */
export interface Tag {
  type?: string;
  name?: string;
  string?: string;
  description?: string;
  // tslint:disable-next-line:no-any
  types?: (string | {[name: string]: any})[];
  typesDescription?: string;
  optional?: boolean;
  nullable?: boolean;
  nonNullable?: boolean;
  variable?: boolean;

  properties?: string[];
  args?: Tag[];
}

/**
 * JSDoc Comment
 */
export interface Comment {
  tags: Tag[];
  description: Description;
  isPrivate?: boolean;
  isEvent?: boolean;
  isConstructor?: boolean;
  line: number;
  ignore?: boolean;
  code: string;
  ctx: Context;
}
