// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeter-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config, Getter} from '@loopback/context';
import {extensionPoint, extensions} from '@loopback/core';
import chalk from 'chalk';
import {Greeter, GREETER_EXTENSION_POINT_NAME} from './types';

/**
 * Options for the greeter extension point
 */
export interface GreetingServiceOptions {
  color: string;
}

/**
 * An extension point for greeters that can greet in different languages
 */
@extensionPoint(GREETER_EXTENSION_POINT_NAME)
export class GreetingService {
  constructor(
    /**
     * Inject a getter function to fetch greeters (bindings tagged with
     * `{[CoreTags.EXTENSION_POINT]: GREETER_EXTENSION_POINT_NAME}`)
     */
    @extensions()
    private getGreeters: Getter<Greeter[]>,
    /**
     * An extension point should be able to receive its options via dependency
     * injection.
     */
    @config() // Sugar for @inject('services.GreetingService.options', {optional: true})
    public readonly options?: GreetingServiceOptions,
  ) {}

  /**
   * Find a greeter that can speak the given language
   * @param language - Language code for the greeting
   */
  async findGreeter(language: string): Promise<Greeter | undefined> {
    // Get the latest list of greeters
    const greeters = await this.getGreeters();
    // Find a greeter that can speak the given language
    return greeters.find(g => g.language === language);
  }

  /**
   * Greet in the given language
   * @param language - Language code
   * @param name - Name
   */
  async greet(language: string, name: string): Promise<string> {
    let greeting = '';

    const greeter = await this.findGreeter(language);
    if (greeter) {
      greeting = greeter.greet(name);
    } else {
      // Fall back to English
      greeting = `Hello, ${name}!`;
    }
    if (this.options && this.options.color) {
      greeting = chalk.keyword(this.options.color)(greeting);
    }
    return greeting;
  }
}
