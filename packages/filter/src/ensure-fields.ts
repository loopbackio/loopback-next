// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/filter
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import _ from 'lodash';
import {Filter, FilterBuilder} from './query';
import {AnyObject} from './types';

/**
 * Ensures that queries which apply the returned filter would always include
 * the target fields. To undo this effect later, fields that were disabled
 * in the original filter will be added to the pruning mask.
 *
 * @param targetFields - An array of fields to include
 * @param filter - A target filter
 * @returns A tuple containing amended filter and pruning mask
 */
export function ensureFields<T extends object = AnyObject>(
  targetFields: (keyof T)[],
  filter: Filter<T>,
) {
  const builder = new FilterBuilder(filter);
  const fields = builder.build().fields;
  if (!fields || matchesFields(targetFields, filter)) {
    return {
      filter: builder.build(),
      fieldsAdded: [] as (keyof T)[],
    };
  }
  const isDisablingOnly = _.size(fields) > 0 && !_.some(fields, Boolean);
  const fieldsAdded = (isDisablingOnly ? _.keys(fields) : []) as (keyof T)[];
  targetFields.forEach(f => {
    if (!fields[f]) {
      fieldsAdded.push(f);
      builder.fields(f);
    }
  });

  const newFilter = builder.build();
  // if the filter only hides the fields, unset the entire fields clause
  if (isDisablingOnly) {
    delete filter.fields;
  }
  return {
    filter: newFilter,
    fieldsAdded: _.uniq(fieldsAdded) as (keyof T)[],
  } as const;
}

/**
 * Checks whether fields array passed as an argument is a
 * subset of fields picked by a target filter.
 *
 * @param fields - An array of fields to search in a filter
 * @param filter - A target filter
 */
export function matchesFields<T extends object = AnyObject>(
  fields: (keyof T)[],
  filter?: Filter<T>,
) {
  const normalized = new FilterBuilder(filter).build();
  const targetFields = normalized.fields;
  if (!targetFields) {
    return true;
  }
  const isDisablingOnly =
    _.size(targetFields) > 0 && !_.some(targetFields, Boolean);
  for (const f of fields) {
    if (!targetFields[f] && (f in targetFields || !isDisablingOnly)) {
      return false;
    }
  }
  return true;
}
