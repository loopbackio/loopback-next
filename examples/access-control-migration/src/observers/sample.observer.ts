// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-access-control-migration
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  CoreBindings,
  inject,
  lifeCycleObserver, // The decorator
  LifeCycleObserver,
} from '@loopback/core';
import * as _ from 'lodash';
import {ProjectRepository} from '../repositories/project.repository';
import {TeamRepository} from '../repositories/team.repository';
import {UserRepository} from '../repositories/user.repository';
import {genSalt, hash} from 'bcryptjs';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class SampleObserver implements LifeCycleObserver {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
    @inject('repositories.ProjectRepository')
    private projectRepo: ProjectRepository,
    @inject('repositories.TeamRepository') private teamRepo: TeamRepository,
    @inject('repositories.UserRepository') private userRepo: UserRepository,
  ) {}

  /**
   * This method will be invoked when the application starts
   */
  async start(): Promise<void> {
    // Add your logic for start
    if (process.env.SEED_DATA) {
      await this.createUsers();
      await this.createProjects();
      await this.createTeams();
    }
  }

  /**
   * This method will be invoked when the application stops
   */
  async stop(): Promise<void> {
    // Add your logic for stop
  }

  async createUsers(): Promise<void> {
    const hashedPassword = await this.hashPassword('opensesame', 10);
    const users = [
      {
        id: 1,
        username: 'John',
        email: 'john@doe.com',
        password: hashedPassword,
      },
      {
        id: 2,
        username: 'Jane',
        email: 'jane@doe.com',
        password: hashedPassword,
      },
      {
        id: 3,
        username: 'Bob',
        email: 'bob@projects.com',
        password: hashedPassword,
      },
    ];

    for (const u of users) {
      await this.userRepo.create(_.pick(u, ['id', 'email', 'username']));
      await this.userRepo
        .userCredentials(u.id)
        .create({password: u.password, userId: u.id});
    }
  }

  async createProjects(): Promise<void> {
    const projects = [
      {id: 1, name: 'project1', balance: 0, ownerId: 1},
      {id: 2, name: 'project2', balance: 0, ownerId: 2},
    ];

    for (const p of projects) {
      await this.projectRepo.create(p);
    }
  }

  async createTeams(): Promise<void> {
    const teams = [
      {id: 1, ownerId: 1, memberIds: [1, 2]},
      {id: 2, ownerId: 2, memberIds: [2]},
    ];

    for (const t of teams) {
      await this.teamRepo.create(t);
    }
  }

  async hashPassword(password: string, rounds: number): Promise<string> {
    const salt = await genSalt(rounds);
    return hash(password, salt);
  }
}
