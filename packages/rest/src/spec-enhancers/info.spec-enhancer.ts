// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  BindingScope,
  inject,
  JSONObject,
  JSONValue,
} from '@loopback/context';
import {ApplicationMetadata, CoreBindings} from '@loopback/core';
import {
  asSpecEnhancer,
  ContactObject,
  mergeOpenAPISpec,
  OASEnhancer,
  OpenApiSpec,
} from '@loopback/openapi-v3';
import debugFactory from 'debug';

const debug = debugFactory('loopback:openapi:spec-enhancer:info');

/**
 * An OpenAPI spec enhancer to populate `info` with application metadata
 * (package.json).
 */
@bind(asSpecEnhancer, {scope: BindingScope.SINGLETON})
export class InfoSpecEnhancer implements OASEnhancer {
  name = 'info';

  constructor(
    @inject(CoreBindings.APPLICATION_METADATA, {optional: true})
    readonly pkg?: ApplicationMetadata,
  ) {}

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    if (this.pkg == null) {
      debug('Application metadata is not found. Skipping spec enhancing.');
      return spec;
    }
    const contact: ContactObject = InfoSpecEnhancer.parseAuthor(
      this.pkg.author,
    );
    const patchSpec = {
      info: {
        title: this.pkg.name,
        description: this.pkg.description,
        version: this.pkg.version,
        contact,
      },
    };
    debug('Enhancing OpenAPI spec with %j', patchSpec);
    return mergeOpenAPISpec(spec, patchSpec);
  }

  /**
   * Parse package.json
   * {@link https://docs.npmjs.com/files/package.json#people-fields-author-contributors | author}
   *
   * @param author - Author string or object from package.json
   */
  private static parseAuthor(author: JSONValue) {
    let contact: ContactObject = {};
    if (author == null) {
      contact = {};
    } else if (typeof author === 'string') {
      // "Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)"
      const emailRegex = /<([^<>]+)>/; // <email>
      const urlRegex = /\(([^()]+)\)/; // (url)
      const nameRegex = /([^<>()]+)/;
      contact = {
        name: nameRegex.exec(author)?.[1]?.trim(),
        email: emailRegex.exec(author)?.[1]?.trim(),
        url: urlRegex.exec(author)?.[1]?.trim(),
      };
    } else if (typeof author === 'object') {
      const authorObj = author as JSONObject;
      contact = {
        name: authorObj.name as string,
        email: authorObj.email as string,
        url: authorObj.url as string,
      };
    }
    // Remove undefined/null values
    for (const p in contact) {
      if (contact[p] == null) delete contact[p];
    }
    return contact;
  }
}
