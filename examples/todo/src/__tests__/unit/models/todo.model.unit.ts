// Copyright IBM Corp. and LoopBack contributors 2018,2026. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Todo} from '../../../models';

describe('Todo (unit)', () => {
  describe('constructor', () => {
    it('creates an instance with no data', () => {
      const todo = new Todo();
      expect(todo).to.be.instanceOf(Todo);
    });

    it('creates an instance with partial data', () => {
      const todo = new Todo({
        title: 'Test Todo',
      });
      expect(todo.title).to.equal('Test Todo');
      expect(todo.id).to.be.undefined();
      expect(todo.desc).to.be.undefined();
    });

    it('creates an instance with complete data', () => {
      const data = {
        id: 1,
        title: 'Test Todo',
        desc: 'Test Description',
        isComplete: false,
        remindAtAddress: '123 Main St, City, 12345',
        remindAtGeo: '40.7128,-74.0060',
        tag: {priority: 'high'},
      };
      const todo = new Todo(data);
      expect(todo.id).to.equal(1);
      expect(todo.title).to.equal('Test Todo');
      expect(todo.desc).to.equal('Test Description');
      expect(todo.isComplete).to.be.false();
      expect(todo.remindAtAddress).to.equal('123 Main St, City, 12345');
      expect(todo.remindAtGeo).to.equal('40.7128,-74.0060');
      expect(todo.tag).to.deepEqual({priority: 'high'});
    });
  });

  describe('properties', () => {
    it('has optional id property', () => {
      const todo = new Todo({title: 'Test'});
      expect(todo).to.not.have.property('id');

      todo.id = 1;
      expect(todo.id).to.equal(1);
    });

    it('has required title property', () => {
      const todo = new Todo({title: 'Required Title'});
      expect(todo.title).to.equal('Required Title');
    });

    it('has optional desc property', () => {
      const todo = new Todo({title: 'Test'});
      expect(todo.desc).to.be.undefined();

      todo.desc = 'Description';
      expect(todo.desc).to.equal('Description');
    });

    it('has optional isComplete property', () => {
      const todo = new Todo({title: 'Test'});
      expect(todo.isComplete).to.be.undefined();

      todo.isComplete = true;
      expect(todo.isComplete).to.be.true();
    });

    it('has optional remindAtAddress property', () => {
      const todo = new Todo({title: 'Test'});
      expect(todo.remindAtAddress).to.be.undefined();

      todo.remindAtAddress = '123 Main St';
      expect(todo.remindAtAddress).to.equal('123 Main St');
    });

    it('has optional remindAtGeo property', () => {
      const todo = new Todo({title: 'Test'});
      expect(todo.remindAtGeo).to.be.undefined();

      todo.remindAtGeo = '40.7128,-74.0060';
      expect(todo.remindAtGeo).to.equal('40.7128,-74.0060');
    });

    it('has optional tag property of any type', () => {
      const todo = new Todo({title: 'Test'});
      expect(todo.tag).to.be.undefined();

      todo.tag = {priority: 'high', category: 'work'};
      expect(todo.tag).to.deepEqual({priority: 'high', category: 'work'});

      todo.tag = 'simple-tag';
      expect(todo.tag).to.equal('simple-tag');

      todo.tag = ['tag1', 'tag2'];
      expect(todo.tag).to.deepEqual(['tag1', 'tag2']);
    });
  });

  describe('data validation', () => {
    it('allows empty description', () => {
      const todo = new Todo({
        title: 'Test',
        desc: '',
      });
      expect(todo.desc).to.equal('');
    });

    it('allows false for isComplete', () => {
      const todo = new Todo({
        title: 'Test',
        isComplete: false,
      });
      expect(todo.isComplete).to.be.false();
    });

    it('allows true for isComplete', () => {
      const todo = new Todo({
        title: 'Test',
        isComplete: true,
      });
      expect(todo.isComplete).to.be.true();
    });

    it('handles complex tag objects', () => {
      const complexTag = {
        priority: 'high',
        labels: ['urgent', 'important'],
        metadata: {
          createdBy: 'user1',
          assignedTo: ['user2', 'user3'],
        },
      };
      const todo = new Todo({
        title: 'Test',
        tag: complexTag,
      });
      expect(todo.tag).to.deepEqual(complexTag);
    });
  });

  describe('edge cases', () => {
    it('handles very long titles', () => {
      const longTitle = 'A'.repeat(1000);
      const todo = new Todo({title: longTitle});
      expect(todo.title).to.equal(longTitle);
      expect(todo.title.length).to.equal(1000);
    });

    it('handles very long descriptions', () => {
      const longDesc = 'B'.repeat(5000);
      const todo = new Todo({
        title: 'Test',
        desc: longDesc,
      });
      expect(todo.desc).to.equal(longDesc);
      expect(todo.desc!.length).to.equal(5000);
    });

    it('handles special characters in title', () => {
      const specialTitle = 'Test @#$%^&*() 测试 🎉';
      const todo = new Todo({title: specialTitle});
      expect(todo.title).to.equal(specialTitle);
    });

    it('handles multiline descriptions', () => {
      const multilineDesc = 'Line 1\nLine 2\nLine 3';
      const todo = new Todo({
        title: 'Test',
        desc: multilineDesc,
      });
      expect(todo.desc).to.equal(multilineDesc);
    });

    it('handles null-like values gracefully', () => {
      const todo = new Todo({
        title: 'Test',
        desc: undefined,
        isComplete: undefined,
      });
      expect(todo.desc).to.be.undefined();
      expect(todo.isComplete).to.be.undefined();
    });
  });

  describe('model inheritance', () => {
    it('extends Entity class', () => {
      const todo = new Todo({title: 'Test'});
      expect(todo).to.have.property('toJSON');
      expect(todo).to.have.property('toObject');
    });

    it('can be serialized to JSON', () => {
      const todo = new Todo({
        id: 1,
        title: 'Test Todo',
        desc: 'Description',
        isComplete: false,
      });
      const json = todo.toJSON();
      expect(json).to.have.property('id', 1);
      expect(json).to.have.property('title', 'Test Todo');
      expect(json).to.have.property('desc', 'Description');
      expect(json).to.have.property('isComplete', false);
    });
  });
});

// Made with Bob
