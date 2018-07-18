// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {IncomingMessage} from 'http';
import * as http from 'http';
import * as https from 'https';
import * as url from 'url';

/**
 * Async wrapper for making HTTP GET requests
 * @param urlString
 */
export function httpGetAsync(urlString: string): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    http.get(urlString, resolve).on('error', reject);
  });
}

/**
 * Async wrapper for making HTTPS GET requests
 * @param urlString
 */
export function httpsGetAsync(urlString: string): Promise<IncomingMessage> {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const urlOptions = url.parse(urlString);
  const options = {agent, ...urlOptions};

  return new Promise((resolve, reject) => {
    https.get(options, resolve).on('error', reject);
  });
}
