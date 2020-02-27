// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector, MetadataMap} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {model, MODEL_PROPERTIES_KEY, property} from '../../../';
import {BaseEntity} from '../../fixtures/mixins/baseEntity';
import {AddCategoryPropertyMixin} from '../../fixtures/mixins/categoryPropertyMixin';

// eslint-disable-next-line mocha/no-exclusive-tests
describe.only('add property to model via mixin', () => {
  @model()
  class Note extends AddCategoryPropertyMixin(BaseEntity) {
    constructor(data?: Partial<Note>) {
      super(data);
    }

    @property({
      type: 'number',
      id: true,
      generated: true,
    })
    id?: number;

    @property({
      type: 'string',
      required: true,
    })
    title: string;

    @property({
      type: 'string',
    })
    content?: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let meta: MetadataMap<any>;

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

  it('metadata for mixin property exists', () => {
    expect(meta.category).to.eql({
      type: 'string',
      required: true,
    });
  });
});
