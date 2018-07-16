// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {
  juggler,
  DefaultKVRepository,
  DataObject,
  Model,
  KVRepository,
} from '../../../';

describe('DefaultKVRepository', () => {
  let ds: juggler.DataSource;
  let kvNoteModel: typeof juggler.KeyValueModel;
  let repo: KVRepository<Note>;

  class Note extends Model {
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
    kvNoteModel = ds.createModel<typeof juggler.KeyValueModel>('note');
    repo = new DefaultKVRepository<Note>(kvNoteModel);
  });

  it('implements KVRepository.set()', async () => {
    const note1 = {title: 't1', content: 'c1'};
    await repo.set('note1', note1);
    const result = await repo.get('note1');
    expect(result).to.eql(note1);
  });

  it('implements KVRepository.get() for non-existent key', async () => {
    const result = await repo.get('note1');
    expect(result).be.null();
  });

  it('implements KVRepository.delete()', async () => {
    const note1 = {title: 't1', content: 'c1'};
    await repo.set('note1', note1);
    await repo.delete('note1');
    const result = await repo.get('note1');
    expect(result).be.null();
  });

  it('implements KVRepository.deleteAll()', async () => {
    await repo.set('note1', {title: 't1', content: 'c1'});
    await repo.set('note2', {title: 't2', content: 'c2'});
    await repo.deleteAll();
    let result = await repo.get('note1');
    expect(result).be.null();
    result = await repo.get('note2');
    expect(result).be.null();
  });

  it('implements KVRepository.ttl()', async () => {
    await repo.set('note1', {title: 't1', content: 'c1'}, {ttl: 100});
    const result = await repo.ttl!('note1');
    expect(result).to.eql(100);
  });

  it('reports error from KVRepository.ttl()', async () => {
    const p = repo.ttl!('note2');
    return expect(p).to.be.rejectedWith(
      'Cannot get TTL for unknown key "note2"',
    );
  });

  it('implements KVRepository.expire()', async () => {
    await repo.set('note1', {title: 't1', content: 'c1'}, {ttl: 100});
    await repo.expire!('note1', 200);
    const ttl = await repo.ttl!('note1');
    expect(ttl).to.eql(200);
  });

  it('implements KVRepository.iterateKeys()', async () => {
    await repo.set('note1', {title: 't1', content: 'c1'});
    await repo.set('note2', {title: 't2', content: 'c2'});
    const keys = repo.iterateKeys!();
    const keyList: string[] = [];
    while (true) {
      const {done, value} = await keys.next();
      if (!done) {
        keyList.push(value);
      } else {
        break;
      }
    }
    expect(keyList).to.eql(['note1', 'note2']);
  });
});
