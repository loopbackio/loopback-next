// Copyright LoopBack contributors 2022. All Rights Reserved.
// Node module: @loopback/sequelize
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Function to check if the `value` is js object (`{}`)
 * @param value Target value to check
 * @returns `true` is it is an object `false` otherwise
 */
export const isTruelyObject = (value?: unknown) => {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
};
