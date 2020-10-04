// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/filter
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {ensureFields, Filter} from '../..';

describe('ensureFields', () => {
  it('does not modify a filter when it does not specify fields', () => {
    const filter = {} as Filter;
    const {filter: newFilter, fieldsAdded} = ensureFields(['a', 'b'], filter);

    expect(newFilter).to.eql({});
    expect(fieldsAdded).to.eql([]);
  });

  it('does not modify a filter when it does not exclude target fields', () => {
    const filter = {fields: {a: false, b: false}} as Filter;
    const {filter: newFilter, fieldsAdded} = ensureFields(['c'], filter);

    expect(newFilter).to.eql({fields: {a: false, b: false}});
    expect(fieldsAdded).to.eql([]);
  });

  it('does not modify a filter when target fields are not specified', () => {
    const filter = {fields: {a: false, b: false}} as Filter;
    const {filter: newFilter, fieldsAdded} = ensureFields([], filter);

    expect(newFilter).to.eql({fields: {a: false, b: false}});
    expect(fieldsAdded).to.eql([]);
  });

  it('adds omitted fields', () => {
    const filter = {fields: {a: true}} as Filter;
    const {filter: newFilter, fieldsAdded} = ensureFields(['b'], filter);

    expect(newFilter).to.eql({fields: {a: true, b: true}});
    expect(fieldsAdded).to.eql(['b']);
  });

  it('adds explicitly disabled fields', () => {
    const filter = {fields: {a: true, b: false}} as Filter;
    const {filter: newFilter, fieldsAdded} = ensureFields(['b'], filter);

    expect(newFilter).to.eql({fields: {a: true, b: true}});
    expect(fieldsAdded).to.eql(['b']);
  });

  it('removes fields clause when it only excludes fields', () => {
    const filter = {fields: {a: false, b: false}} as Filter;
    const {filter: newFilter, fieldsAdded} = ensureFields(['b'], filter);

    expect(newFilter).to.eql({});
    expect(fieldsAdded).to.eql(['a', 'b']);
  });
});
