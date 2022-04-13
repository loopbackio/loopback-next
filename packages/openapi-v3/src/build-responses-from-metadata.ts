// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DecoratorFactory, MetadataInspector} from '@loopback/core';
import {Model, MODEL_KEY} from '@loopback/repository';
import {
  ContentObject,
  OperationObject,
  ResponseDecoratorMetadata,
  ResponseModelOrSpec,
  ResponseObject,
} from './types';

declare type ContentMap = Map<string, ResponseModelOrSpec[]>;
declare type ResponseMap = Map<
  number,
  {description: string; content: ContentMap}
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isModel<T extends Model>(c: any): c is T {
  return (
    c?.prototype instanceof Model ||
    // Allowing classes decorated with `@model` but not extending from `Model`
    MetadataInspector.getClassMetadata(MODEL_KEY, c) != null
  );
}

/**
 * Reducer which builds the operation responses
 */
function reduceSpecContent(
  specContents: ContentObject,
  [contentType, modelOrSpecs]: [string, ResponseModelOrSpec[]],
): ContentObject {
  if (Array.isArray(modelOrSpecs) && modelOrSpecs.length > 1) {
    specContents[contentType] = {
      schema: {
        anyOf: modelOrSpecs.map(m => {
          if (isModel(m)) {
            return {'x-ts-type': m};
          } else {
            return m;
          }
        }),
      },
    };
  } else {
    const modelOrSpec = Array.isArray(modelOrSpecs)
      ? modelOrSpecs[0]
      : modelOrSpecs;
    if (isModel(modelOrSpec)) {
      specContents[contentType] = {
        schema: {'x-ts-type': modelOrSpec},
      };
    } else {
      specContents[contentType] = {
        schema: modelOrSpec,
      };
    }
  }
  return specContents;
}

/**
 * Reducer which builds the content sections of the operation responses
 */
function reduceSpecResponses(
  specResponses: ResponseObject,
  [responseCode, c]: [number, {description: string; content: ContentMap}],
): ResponseObject {
  const responseContent = c.content;
  // check if there is an existing block, from something like an inhered @op spec
  if (Object.prototype.hasOwnProperty.call(specResponses, responseCode)) {
    // we might need to merge
    const content = Array.from(responseContent).reduce(
      reduceSpecContent,
      specResponses[responseCode].content as ContentObject,
    );

    specResponses[responseCode] = {
      description: c.description,
      content,
    };
  } else {
    const content = Array.from(responseContent).reduce(
      reduceSpecContent,
      {} as ContentObject,
    );

    specResponses[responseCode] = {
      description: c.description,
      content,
    };
  }
  return specResponses;
}

/**
 * This function takes an array of flat-ish data:
 * ```
 * [
 *  { responseCode, contentType, description, modelOrSpec },
 *  { responseCode, contentType, description, modelOrSpec },
 * ]
 * ```
 * and turns it into a multi-map structure that more closely aligns with
 * the final json
 * ```
 * Map{ [code, Map{[contentType, modelOrSpec], [contentType, modelOrSpec]}]}
 * ```
 */
function buildMapsFromMetadata(
  metadata: ResponseDecoratorMetadata,
): ResponseMap {
  const builder: ResponseMap = new Map();
  metadata.forEach(r => {
    if (builder.has(r.responseCode)) {
      const responseRef = builder.get(r.responseCode);
      const codeRef = responseRef?.content;

      if (codeRef?.has(r.contentType)) {
        codeRef.get(r.contentType)?.push(r.responseModelOrSpec);
      } else {
        codeRef?.set(r.contentType, [r.responseModelOrSpec]);
      }
    } else {
      const codeRef = new Map();
      codeRef.set(r.contentType, [r.responseModelOrSpec]);
      builder.set(r.responseCode, {
        description: r.description,
        content: codeRef,
      });
    }
  });
  return builder;
}
export function buildResponsesFromMetadata(
  metadata: ResponseDecoratorMetadata,
  existingOperation?: OperationObject,
): OperationObject {
  const builder = buildMapsFromMetadata(metadata);
  const base = existingOperation
    ? DecoratorFactory.cloneDeep(existingOperation.responses)
    : {};
  // Now, mega-reduce.
  const responses: ResponseObject = Array.from(builder).reduce(
    reduceSpecResponses,
    base as ResponseObject,
  );

  return {
    responses,
  };
}
