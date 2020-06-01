// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector, MetadataMap} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {MODEL_PROPERTIES_KEY} from '../../../';
import {Note} from '../../fixtures/models/note.model';

describe('add property to model via mixin', () => {
  let meta: MetadataMap<unknown>;

  before(async () => {
    meta =
      MetadataInspector.getAllPropertyMetadata(
        MODEL_PROPERTIES_KEY,
        Note.prototype,
      ) ?? /* istanbul ignore next */ {};
  });

  it('metadata for non-mixin properties exist', () => {
    expect(!!meta).to.be.True();
    expect(meta.id).to.eql({
      type: 'number',
      id: true,
      generated: true,
      useDefaultIdType: false,
    });

    expect(meta.title).to.eql({
      type: 'string',
      required: true,
    });

    expect(meta.content).to.eql({
      type: 'string',
    });
  });

  it(`metadata for mixin property 'category' exists`, () => {
    expect(meta.category).to.eql({
      type: 'string',
      required: true,
    });
  });
});
