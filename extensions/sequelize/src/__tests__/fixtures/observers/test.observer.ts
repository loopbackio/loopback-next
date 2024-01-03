import {lifeCycleObserver, type LifeCycleObserver} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';

/**
 * Test observer for validating that the Sequelize repositories are available in Loopback Observers during server startup.
 */
@lifeCycleObserver('test')
export class TestObserver implements LifeCycleObserver {
  constructor(
    @repository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async start(): Promise<void> {
    try {
      await this.userRepository.find();
    } catch (error) {
      // For the repository tests, the database schema is not created until after the server is initialized:
      // extensions/sequelize/src/__tests__/integration/repository.integration.ts
      if (!error.message.includes('no such table: User')) {
        throw error;
      }
    }
  }
}
