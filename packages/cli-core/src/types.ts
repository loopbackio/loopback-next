// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli-core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor, Context} from '@loopback/context';
import {extensionFor} from '@loopback/core';
import Generator from 'yeoman-generator';
import {inspectGeneratorMetadata} from './decorators';

/**
 * Generator interface for LoopBack
 */
export interface LoopBackGenerator extends Generator {
  /**
   * JSON object for `package.json`
   */
  packageJson?: Record<string, unknown>;
  /**
   * Name of the command
   */
  command?: string;
  /**
   * Instruct to exit
   * @param err - Reason to exit
   */
  exit(err: unknown): void;
  /**
   * Check if the generator should exit
   */
  shouldExit(): boolean;
}

/**
 * Metadata for generators
 */
export interface GeneratorMetadata {
  /**
   * Name of the generator, such as `app`, `controller`, or `model`.
   */
  name: string;
  /**
   * Resolved path to the generator class
   */
  path?: string;

  /**
   * Constructor for the generator
   */
  ctor?: Constructor<Generator>;
}

/**
 * Get the metadata for a generator
 * @param ctor - Constructor of the generator
 * @param name - Optional name
 * @param path - Optional module path
 */
export function getGeneratorMetadata(
  ctor: Constructor<Generator>,
  name?: string,
  path?: string,
): GeneratorMetadata {
  const metadata = inspectGeneratorMetadata(ctor);
  if (metadata != null) return metadata;
  if (name == null) {
    name = ctor.name;
    if (name.endsWith('Generator')) {
      name = name.substring(0, name.length - 'Generator'.length);
      name = name.toLowerCase();
    }
  }
  return {
    name,
    path,
    ctor: ctor,
  };
}

/**
 * Name of the generators extension point
 */
export const GENERATORS = 'cli.generators';

/**
 * Prefix for the generator namespace
 */
export const LOOPBACK_PREFIX = 'loopback4:';

/**
 * Options to run commands
 */
export interface RunOptions {
  log?: (message?: unknown, ...args: unknown[]) => void;
  dryRun: boolean;
}

/**
 * Register a generator to the given context
 * @param ctx - Context object
 * @param ctorOrMetadata - Constructor or metadata for the generator
 */
export function registerGenerator(
  ctx: Context,
  ctorOrMetadata: Constructor<Generator> | GeneratorMetadata,
) {
  let metadata: GeneratorMetadata = ctorOrMetadata;
  if (typeof ctorOrMetadata === 'function') {
    metadata = getGeneratorMetadata(ctorOrMetadata);
  }
  return ctx
    .bind(`generators.${metadata.name}`)
    .to(metadata)
    .apply(extensionFor(GENERATORS));
}
