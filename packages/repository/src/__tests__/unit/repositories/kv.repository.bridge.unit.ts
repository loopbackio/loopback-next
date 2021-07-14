// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {
  juggler,
  DefaultKeyValueRepository,
  DataObject,
  KeyValueRepository,
  Entity,
} from '../../../';

describe('DefaultKeyValueRepository', () => {
  let ds: juggler.DataSource;
  let repo: KeyValueRepository<Note>;

  class Note extends Entity {
    title?: string;
    content?: string;
    id: number;

    constructor(data: DataObject<Note>) {
      super(data);
    }
  }

  beforeEach(() => {
    ds = new juggler.DataSource({
      name: 'db',
      connector: 'kv-memory',
    });
    repo = new DefaultKeyValueRepository<Note>(Note, ds);
  });

  it('implements KeyValueRepository.set()', async () => {
    const note1 = {title: 't1', content: 'c1'};
    await repo.set('note1', note1);
    const result = await repo.get('note1');
    expect(result).to.eql(new Note(note1));
  });

  it('implements KeyValueRepository.get() for non-existent key', async () => {
    const result = await repo.get('note1');
    expect(result).be.null();
  });

  it('implements KeyValueRepository.delete()', async () => {
    const note1 = {title: 't1', content: 'c1'};
    await repo.set('note1', note1);
    await repo.delete('note1');
    const result = await repo.get('note1');
    expect(result).be.null();
  });

  it('implements KeyValueRepository.deleteAll()', async () => {
    await repo.set('note1', {title: 't1', content: 'c1'});
    await repo.set('note2', {title: 't2', content: 'c2'});
    await repo.deleteAll();
    let result = await repo.get('note1');
    expect(result).be.null();
    result = await repo.get('note2');
    expect(result).be.null();
  });

  it('implements KeyValueRepository.ttl()', async () => {
    await repo.set('note1', {title: 't1', content: 'c1'}, {ttl: 100});
    const result = await repo.ttl!('note1');
    // The remaining ttl <= original ttl
    expect(result).to.be.lessThanOrEqual(100);
  });

  it('reports error from KeyValueRepository.ttl()', async () => {
    const p = repo.ttl!('note2');
    return expect(p).to.be.rejectedWith(
      'Cannot get TTL for unknown key "note2"',
    );
  });

  it('implements KeyValueRepository.expire()', async () => {
    await repo.set('note1', {title: 't1', content: 'c1'}, {ttl: 100});
    await repo.expire!('note1', 200);
    const ttl = await repo.ttl!('note1');
    expect(ttl).to.lessThanOrEqual(200);
  });

  it('implements KeyValueRepository.keys()', async () => {
    await repo.set('note1', {title: 't1', content: 'c1'});
    await repo.set('note2', {title: 't2', content: 'c2'});
    const keys = repo.keys!();
    const keyList: string[] = [];
    for await (const k of keys) {
      keyList.push(k);
    }
    expect(keyList).to.eql(['note1', 'note2']);
  });
});
