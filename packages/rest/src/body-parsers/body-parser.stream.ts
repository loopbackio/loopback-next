// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Request} from '../types';
import {BodyParser, RequestBody} from './types';
import {builtinParsers} from './body-parser.helpers';

/**
 * A special body parser to retain request stream as is.
 * It will be used by explicitly setting `x-parser` to `'stream'` in the request
 * body spec.
 */
export class StreamBodyParser implements BodyParser {
  name = builtinParsers.stream;

  supports(mediaType: string) {
    // Return `false` so that this parser can only be trigged by the
    // `{x-parser: 'stream'}` extension in the request body spec
    return false;
  }

  async parse(request: Request): Promise<RequestBody> {
    return {value: request};
  }
}
