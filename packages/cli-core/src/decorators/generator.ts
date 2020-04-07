// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli-core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ClassDecoratorFactory,
  Constructor,
  MetadataAccessor,
  MetadataInspector,
} from '@loopback/core';
import Generator from 'yeoman-generator';
import {GeneratorMetadata, getGeneratorMetadata} from '../types';

const GENERATOR_METADATA_KEY = MetadataAccessor.create<
  GeneratorMetadata,
  ClassDecorator
>('generator.metadata');

/**
 * `@generator` decorates a class as a yeoman generator
 * @param name - Optional name
 * @param path - Optional path for the generator class file
 */
export function generator(name?: string, path?: string) {
  return (target: Function) => {
    ClassDecoratorFactory.createDecorator<GeneratorMetadata>(
      GENERATOR_METADATA_KEY,
      getGeneratorMetadata(target as Constructor<Generator>, name, path),
    )(target);
  };
}

export function inspectGeneratorMetadata(ctor: Constructor<Generator>) {
  return MetadataInspector.getClassMetadata(GENERATOR_METADATA_KEY, ctor, {
    ownMetadataOnly: true,
  });
}
