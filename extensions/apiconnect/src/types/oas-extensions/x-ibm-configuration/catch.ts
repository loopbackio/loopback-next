import {Execute} from './assembly';

export type Catch<ET extends Execute.Execute> =
  | {
      errors: string[];
      execute: ET[];
    }
  | {
      default: ET[];
    };
