// Copyright LoopBack contributors 2022. All Rights Reserved.
// Node module: @loopback/sequelize
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Operators} from '@loopback/repository';
import {Op} from 'sequelize';

/**
 * @key Operator used in loopback
 * @value Equivalent operator in Sequelize
 */
export const operatorTranslations: {
  [key in Operators]?: symbol;
} = {
  eq: Op.eq,
  gt: Op.gt,
  gte: Op.gte,
  lt: Op.lt,
  lte: Op.lte,
  neq: Op.ne,
  between: Op.between,
  inq: Op.in,
  nin: Op.notIn,
  like: Op.like,
  nlike: Op.notLike,
  ilike: Op.iLike,
  nilike: Op.notILike,
  regexp: Op.regexp,
  and: Op.and,
  or: Op.or,
  match: Op.match,
  contains: Op.contains,
};
