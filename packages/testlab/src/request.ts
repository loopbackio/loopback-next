// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import http, {IncomingMessage} from 'http';
import https from 'https';
import url from 'url';

/**
 * Async wrapper for making HTTP GET requests
 * @param urlString
 */
export function httpGetAsync(
  urlString: string,
  agent?: http.Agent,
): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const urlOptions = url.parse(urlString);
    const options = {agent, ...urlOptions};
    http.get(options, resolve).on('error', reject);
  });
}

/**
 * Async wrapper for making HTTPS GET requests
 * @param urlString
 */
export function httpsGetAsync(
  urlString: string,
  agent?: https.Agent,
): Promise<IncomingMessage> {
  agent =
    agent ??
    new https.Agent({
      rejectUnauthorized: false,
    });

  const urlOptions = url.parse(urlString);
  const options = {agent, ...urlOptions};

  return new Promise((resolve, reject) => {
    https.get(options, resolve).on('error', reject);
  });
}
