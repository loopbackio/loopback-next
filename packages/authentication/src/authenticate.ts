// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import * as http from 'http';
import BasicStrategy from ('passport-http').BasicStrategy;


//Stub for Deepak's Authentication wrapper class for passport
export class Authentication {
  //stub
  private strategyCtor: BasicStrategy;

  constructor(strategy: BasicStrategy) {
    //stub
    this.strategyCtor = strategy;
  }

  //[@rashmihunt] TODO - stub implementation for now until Deepak's implementation for Authentication 
  //wrapper is in place
  getAuthenticatedUser = (
    req: http.ServerRequest
  ) => {
      this.strategyCtor.authenticate(req);
      //return user after autheticate
      //stub hardcoded user
      return {username: 'joe', password: '12345'}
  };

  authenticate(req:http.ServerRequest) {
    //stub
    this.strategyCtor.authenticate(req);
  }
}