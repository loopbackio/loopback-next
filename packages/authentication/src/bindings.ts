// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as http from 'http';
import {Authentication} from './authenticate';

/**
 * Authenticates http request using basic strategy and returns authenticated 
 * user. If user is not authenticated, http 401 Access denied is sent to the 
 * client.
 * @param required {boolean} Authentication required?
 * @param res {http.ServerRequest} The incoming http request.
 * @param strategy {Authentication} Authentication wrapper for Basic Strategy.
 */
export const getAuthenticatedUser = (
  required: boolean, 
  req: http.ServerRequest,
  strategy: Authentication
 ) => {
    const user =  strategy.getAuthenticatedUser(req);
    if (required && !user) throw createAuthError(401, 'Access is denied due to invalid credentials');
    return user;
};

interface HttpError extends Error {
  statusCode?: number;
  status?: number;
}

function createAuthError(statusCode: number, message: string) {
  const err = new Error(message) as HttpError;
  err.statusCode = statusCode;
  return err;
}