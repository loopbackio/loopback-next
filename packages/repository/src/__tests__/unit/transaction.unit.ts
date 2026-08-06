// Copyright IBM Corp. 2019,2026. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {IsolationLevel, Transaction} from '../../transaction';

describe('Transaction', () => {
  describe('interface', () => {
    it('defines commit method', async () => {
      const tx: Transaction = {
        id: 'tx-1',
        commit: async () => {},
        rollback: async () => {},
        isActive: () => true,
      };
      await tx.commit();
      // Should not throw
    });

    it('defines rollback method', async () => {
      const tx: Transaction = {
        id: 'tx-1',
        commit: async () => {},
        rollback: async () => {},
        isActive: () => true,
      };
      await tx.rollback();
      // Should not throw
    });

    it('defines isActive method', () => {
      const tx: Transaction = {
        id: 'tx-1',
        commit: async () => {},
        rollback: async () => {},
        isActive: () => true,
      };
      expect(tx.isActive()).to.be.true();
    });

    it('defines id property', () => {
      const tx: Transaction = {
        id: 'tx-123',
        commit: async () => {},
        rollback: async () => {},
        isActive: () => true,
      };
      expect(tx.id).to.equal('tx-123');
    });

    it('supports inactive transaction', () => {
      const tx: Transaction = {
        id: 'tx-1',
        commit: async () => {},
        rollback: async () => {},
        isActive: () => false,
      };
      expect(tx.isActive()).to.be.false();
    });

    it('supports transaction with numeric id', () => {
      const tx: Transaction = {
        id: '12345',
        commit: async () => {},
        rollback: async () => {},
        isActive: () => true,
      };
      expect(tx.id).to.equal('12345');
    });

    it('supports transaction with UUID id', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const tx: Transaction = {
        id: uuid,
        commit: async () => {},
        rollback: async () => {},
        isActive: () => true,
      };
      expect(tx.id).to.equal(uuid);
    });
  });

  describe('IsolationLevel', () => {
    it('defines READ_COMMITTED level', () => {
      expect(IsolationLevel.READ_COMMITTED).to.equal('READ COMMITTED');
    });

    it('defines READ_UNCOMMITTED level', () => {
      expect(IsolationLevel.READ_UNCOMMITTED).to.equal('READ UNCOMMITTED');
    });

    it('defines SERIALIZABLE level', () => {
      expect(IsolationLevel.SERIALIZABLE).to.equal('SERIALIZABLE');
    });

    it('defines REPEATABLE_READ level', () => {
      expect(IsolationLevel.REPEATABLE_READ).to.equal('REPEATABLE READ');
    });

    it('has exactly 4 isolation levels', () => {
      const levels = Object.keys(IsolationLevel);
      expect(levels).to.have.length(4);
    });

    it('all levels are strings', () => {
      for (const level in IsolationLevel) {
        expect(
          IsolationLevel[level as keyof typeof IsolationLevel],
        ).to.be.a.String();
      }
    });

    it('can be used in type annotations', () => {
      const level: IsolationLevel = IsolationLevel.READ_COMMITTED;
      expect(level).to.equal('READ COMMITTED');
    });

    it('supports comparison', () => {
      const level1 = IsolationLevel.READ_COMMITTED;
      const level2 = IsolationLevel.READ_COMMITTED;
      expect(level1).to.equal(level2);
    });

    it('different levels are not equal', () => {
      const level1 = IsolationLevel.READ_COMMITTED;
      const level2 = IsolationLevel.SERIALIZABLE;
      expect(level1).to.not.equal(level2);
    });
  });
});

// Made with Bob
