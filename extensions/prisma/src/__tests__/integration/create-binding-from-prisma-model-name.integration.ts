// Copyright The LoopBack Authors 2021.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Prisma, PrismaClient} from '@prisma/client';
import {createBindingFromPrismaModelName} from '../../';
import {BindingType} from '../../../../../packages/context/dist';
import {PrismaBindings} from '../../keys';

describe('createBinidngFromPrismaModelName', () => {
  it('creates new Binding from model name and instance from Prisma', () => {
    const binding = createBindingFromPrismaModelName(
      Prisma.ModelName['User'],
      new PrismaClient().user,
    );
    expect(binding.key).to.equal(
      `${PrismaBindings.PRISMA_MODEL_NAMESPACE}.User`,
    );
    expect(binding.type).to.equal(BindingType.CONSTANT);
    expect(binding.tagMap).to.deepEqual({
      [PrismaBindings.PRISMA_MODEL_TAG]: PrismaBindings.PRISMA_MODEL_TAG,
    });
  });
});
