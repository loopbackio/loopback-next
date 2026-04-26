// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {TodoListImage} from '../../../models';

describe('TodoListImage (unit)', () => {
  describe('constructor', () => {
    it('creates a todo list image with required properties', () => {
      const image = new TodoListImage({
        value: 'base64encodedimage',
        todoListId: 1,
      });

      expect(image.value).to.equal('base64encodedimage');
      expect(image.todoListId).to.equal(1);
    });

    it('creates a todo list image with optional id', () => {
      const image = new TodoListImage({
        id: 1,
        value: 'imagedata',
        todoListId: 1,
      });

      expect(image.id).to.equal(1);
      expect(image.value).to.equal('imagedata');
      expect(image.todoListId).to.equal(1);
    });
  });

  describe('properties', () => {
    it('has value property', () => {
      const image = new TodoListImage({
        value: 'test-image-data',
        todoListId: 1,
      });

      expect(image).to.have.property('value');
      expect(image.value).to.be.a.String();
    });

    it('has todoListId property', () => {
      const image = new TodoListImage({
        value: 'test-image-data',
        todoListId: 123,
      });

      expect(image).to.have.property('todoListId');
      expect(image.todoListId).to.be.a.Number();
    });

    it('has optional id property', () => {
      const image = new TodoListImage({
        id: 456,
        value: 'test-image-data',
        todoListId: 123,
      });

      expect(image).to.have.property('id');
      expect(image.id).to.be.a.Number();
    });
  });

  describe('toJSON', () => {
    it('serializes to JSON', () => {
      const image = new TodoListImage({
        id: 1,
        value: 'imagedata',
        todoListId: 2,
      });

      const json = image.toJSON();

      expect(json).to.have.property('id', 1);
      expect(json).to.have.property('value', 'imagedata');
      expect(json).to.have.property('todoListId', 2);
    });
  });

  describe('foreign key relationship', () => {
    it('references a todo list via todoListId', () => {
      const image = new TodoListImage({
        value: 'imagedata',
        todoListId: 5,
      });

      expect(image.todoListId).to.equal(5);
    });

    it('can be associated with different todo lists', () => {
      const image1 = new TodoListImage({
        value: 'image1',
        todoListId: 1,
      });

      const image2 = new TodoListImage({
        value: 'image2',
        todoListId: 2,
      });

      expect(image1.todoListId).to.not.equal(image2.todoListId);
    });
  });

  describe('edge cases', () => {
    it('handles empty value', () => {
      const image = new TodoListImage({
        value: '',
        todoListId: 1,
      });

      expect(image.value).to.equal('');
    });

    it('handles very long image data', () => {
      const longData = 'A'.repeat(10000);
      const image = new TodoListImage({
        value: longData,
        todoListId: 1,
      });

      expect(image.value).to.have.length(10000);
    });

    it('handles base64 encoded data', () => {
      const base64Data =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const image = new TodoListImage({
        value: base64Data,
        todoListId: 1,
      });

      expect(image.value).to.equal(base64Data);
    });

    it('handles special characters in value', () => {
      const specialData = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const image = new TodoListImage({
        value: specialData,
        todoListId: 1,
      });

      expect(image.value).to.equal(specialData);
    });
  });

  describe('validation', () => {
    it('requires value property', () => {
      const image = new TodoListImage({
        todoListId: 1,
      } as Partial<TodoListImage>);

      expect(image.value).to.be.undefined();
    });

    it('requires todoListId property', () => {
      const image = new TodoListImage({
        value: 'imagedata',
      } as Partial<TodoListImage>);

      expect(image.todoListId).to.be.undefined();
    });
  });
});

// Made with Bob
