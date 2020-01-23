// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {HttpCachingProxy} from '@loopback/http-caching-proxy';
import {merge} from 'lodash';
import path from 'path';
import GEO_CODER_CONFIG from '../datasources/geocoder.datasource.config.json';
import {Todo} from '../models/index';
import {Geocoder, GeoPoint} from '../services/geocoder.service';

/*
 ==============================================================================
 HELPER FUNCTIONS
 If you find yourself creating the same helper functions across different
 test files, then extracting those functions into helper modules is an easy
 way to reduce duplication.

 Other tips:

 - Using the super awesome Partial<T> type in conjunction with Object.assign
   means you can:
   * customize the object you get back based only on what's important
   to you during a particular test
   * avoid writing test logic that is brittle with respect to the properties
   of your object
 - Making the input itself optional means you don't need to do anything special
   for tests where the particular details of the input don't matter.
 ==============================================================================
 *

/**
 * Generate a complete Todo object for use with tests.
 * @param todo - A partial (or complete) Todo object.
 */
export function givenTodo(todo?: Partial<Todo>) {
  const data = Object.assign(
    {
      title: 'do a thing',
      desc: 'There are some things that need doing',
      isComplete: false,
    },
    todo,
  );
  return new Todo(data);
}

export const aLocation = {
  address: '1 New Orchard Road, Armonk, 10504',
  geopoint: <GeoPoint>{y: 41.109653, x: -73.72467},
  get geostring() {
    return `${this.geopoint.y},${this.geopoint.x}`;
  },
};

export function getProxiedGeoCoderConfig(proxy: HttpCachingProxy) {
  return merge({}, GEO_CODER_CONFIG, {
    options: {
      proxy: proxy.url,
      tunnel: false,
    },
  });
}

export {HttpCachingProxy};
export async function givenCachingProxy() {
  const proxy = new HttpCachingProxy({
    cachePath: path.resolve(__dirname, '.http-cache'),
    logError: false,
    timeout: 5000,
  });
  await proxy.start();
  return proxy;
}

export async function isGeoCoderServiceAvailable(service: Geocoder) {
  try {
    await service.geocode(aLocation.address);
    return true;
  } catch (err) {
    if (err.statusCode === 502) {
      return false;
    }
    throw err;
  }
}
