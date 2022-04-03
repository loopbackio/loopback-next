import {Fields} from '@loopback/filter';
import {cloneDeep} from 'lodash';

export function includeFieldIfNot<MT>(
  fields: Fields<MT> | undefined,
  fieldToInclude: Extract<keyof MT, string>,
): false | Fields<MT> {
  if (!fields) {
    return false;
  } else if (Array.isArray(fields)) {
    const fieldsCloned: {[P in keyof MT]?: boolean} = fields.reduce(
      (prev, current) => ({...prev, [current]: true}),
      {},
    );
    if (Object.keys(fieldsCloned).length > 0) {
      if (fieldsCloned[fieldToInclude] === true) {
        return false;
      }
      fieldsCloned[fieldToInclude] = true;
      return fieldsCloned;
    }
    return false;
  }

  const fieldsCloned = cloneDeep(fields);
  if (Object.keys(fieldsCloned).length > 0) {
    let containsTrue = false;
    for (const k in fieldsCloned) {
      if (fieldsCloned[k] === true) {
        containsTrue = true;
      }
    }
    for (const k in fieldsCloned) {
      if (k === fieldToInclude) {
        if (fieldsCloned[k] === true) {
          return false;
        } else {
          if (containsTrue) {
            fieldsCloned[k] = true;
          } else {
            delete fieldsCloned[k];
          }
          return fieldsCloned;
        }
      }
    }
    if (containsTrue) {
      fieldsCloned[fieldToInclude] = true;
      return fieldsCloned;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
