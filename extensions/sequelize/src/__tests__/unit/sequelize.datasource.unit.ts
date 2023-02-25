import {expect} from '@loopback/testlab';
import {SequelizeDataSource} from '../../sequelize';
import {SupportedLoopbackConnectors} from '../../sequelize/connector-mapping';

describe('Sequelize DataSource', () => {
  it('throws error when nosql connectors are supplied', () => {
    try {
      new SequelizeDataSource({
        name: 'db',
        user: 'test',
        password: 'secret',
        connector: 'memory' as SupportedLoopbackConnectors,
      });
    } catch (err) {
      const result = err.message;
      expect(result).which.eql('Specified connector memory is not supported.');
    }
  });
});
