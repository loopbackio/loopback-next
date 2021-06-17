// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/rest-msgpack
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {BodyParser, RestBindings} from '@loopback/rest';

export namespace MsgPackBodyParserBindings {
  export const BODY_PARSER = BindingKey.create<BodyParser>(
    `${RestBindings.REQUEST_BODY_PARSER}.msgpack`,
  );
}
