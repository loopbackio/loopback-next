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

  it('parses pool options for postgresql', async () => {
    const dataSource = new SequelizeDataSource({
      name: 'db',
      connector: 'postgresql',
      min: 10,
      max: 20,
      idleTimeoutMillis: 18000,
    });

    const poolOptions = dataSource.getPoolOptions();

    expect(poolOptions).to.have.property('min', 10);
    expect(poolOptions).to.have.property('max', 20);
    expect(poolOptions).to.have.property('idle', 18000);
    expect(poolOptions).to.not.have.property('acquire');
  });

  it('parses pool options for mysql', async () => {
    const dataSource = new SequelizeDataSource({
      name: 'db',
      connector: 'mysql',
      connectionLimit: 20,
      acquireTimeout: 10000,
    });

    const poolOptions = dataSource.getPoolOptions();

    expect(poolOptions).to.have.property('max', 20);
    expect(poolOptions).to.have.property('acquire', 10000);
    expect(poolOptions).to.not.have.property('min');
    expect(poolOptions).to.not.have.property('idle');
  });

  it('parses pool options for oracle', async () => {
    const dataSource = new SequelizeDataSource({
      name: 'db',
      connector: 'oracle',
      minConn: 10,
      maxConn: 20,
      timeout: 20000,
    });

    const poolOptions = dataSource.getPoolOptions();

    expect(poolOptions).to.have.property('min', 10);
    expect(poolOptions).to.have.property('max', 20);
    expect(poolOptions).to.have.property('idle', 20000);
    expect(poolOptions).to.not.have.property('acquire');
  });
});
