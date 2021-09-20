// Copyright The LoopBack Authors 2021.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, BindingType} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {createBindingFromPrismaModelName} from '../../helpers';
import {PrismaBindings} from '../../keys';

describe('createBindingFromPrismaModelName', () => {
  it('creates new Binding from model instance and name', () => {
    const binding = createBindingFromPrismaModelName('MyModelName', {});

    expectBindingDefaults(binding);
  });

  it('creates new binding without model instance', () => {
    const binding = createBindingFromPrismaModelName('MyModelName');

    expectBindingDefaults(binding, {
      skip: {type: true},
    });
  });

  it('honors custom namespace', () => {
    const binding = createBindingFromPrismaModelName(
      'MyModelName',
      {},
      {
        namespace: 'myCustomNamespace',
      },
    );

    expectBindingDefaults(binding, {
      skip: {key: true},
    });
    expect(binding.key).to.equal('myCustomNamespace.MyModelName');
  });

  it('honors custom tag array', () => {
    const binding = createBindingFromPrismaModelName(
      'MyModelName',
      {},
      {
        tags: ['customTag1', 'customTag2'],
      },
    );

    expectBindingDefaults(binding, {
      skip: {tagMap: true},
    });
    expect(binding.tagMap).to.deepEqual({
      customTag1: 'customTag1',
      customTag2: 'customTag2',
    });
  });

  it('honors custom TagMap', () => {
    const binding = createBindingFromPrismaModelName(
      'MyModelName',
      {},
      {
        tags: {
          customTag1: 'customTag1',
          customTag2: 'customTag2',
        },
      },
    );

    expectBindingDefaults(binding, {
      skip: {tagMap: true},
    });
    expect(binding.tagMap).to.deepEqual({
      customTag1: 'customTag1',
      customTag2: 'customTag2',
    });
  });

  function expectBindingDefaults(
    binding: Binding,
    options?: {
      skip?: {
        tagMap?: boolean;
        key?: boolean;
        type?: boolean;
      };
    },
  ) {
    expect(binding.isLocked).to.be.false();

    if (!options?.skip?.type)
      expect(binding.type).to.equal(BindingType.CONSTANT);

    if (!options?.skip?.key)
      expect(binding.key).to.be.equal(
        `${PrismaBindings.PRISMA_MODEL_NAMESPACE}.MyModelName`,
      );

    if (!options?.skip?.tagMap)
      expect(binding.tagMap).to.deepEqual({
        [PrismaBindings.PRISMA_MODEL_TAG]: PrismaBindings.PRISMA_MODEL_TAG,
      });
  }
});
