import {Constructor} from '@loopback/context';
import {property} from '../../../index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AddCategoryPropertyMixin<T extends Constructor<any>>(
  superClass: T,
) {
  class MixedModel extends superClass {
    @property({
      type: 'string',
      required: true,
    })
    category: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }
  }
  return MixedModel;
}
