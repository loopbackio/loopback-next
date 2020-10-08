// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ws} from '../../../decorators';

export const METHODS_TEST_CONTROLER_NSP = '/with-methods/ws';

@ws.controller(METHODS_TEST_CONTROLER_NSP)
export class MethodsTestController {
  public calledMethods = {
    onConnectOne: 0,
    onConnectTwo: 0,
    firstMethod: 0,
    secondMethod: 0,
    thirdMethod: 0,
    topMethods: 0,
    onDisconnect: 0,
    fourthMethod1: 0,
    fourthMethod2: 0,
    fifthMethod: 0,
  };
  @ws.connect()
  onConnectOne() {
    this.calledMethods.onConnectOne += 1;
  }

  @ws.connect()
  onConnectTwo() {
    this.calledMethods.onConnectTwo += 1;
  }

  @ws.subscribe('firstEventName1', 'firstEventName2')
  firstMethod() {
    this.calledMethods.firstMethod += 1;
  }

  @ws.subscribe('secondEventName', /^otherSecondEventName$/)
  secondMethod() {
    this.calledMethods.secondMethod += 1;
  }

  @ws.subscribe('thirdEventName')
  thirdMethod() {
    this.calledMethods.thirdMethod += 1;
  }

  @ws.subscribe(
    'firstEventName1',
    'firstEventName2',
    'secondEventName',
    /^otherSecondEventName$/,
    'thirdEventName',
  )
  topMethods() {
    this.calledMethods.topMethods += 1;
  }

  @ws.subscribe(/^fourthEventName$/)
  fourthMethod1() {
    this.calledMethods.fourthMethod1 += 1;
  }

  @ws.subscribe(/^fourthEventName$/)
  fourthMethod2() {
    this.calledMethods.fourthMethod2 += 1;
  }

  @ws.subscribe(/^fifthEventName$/)
  fifthMethod() {
    this.calledMethods.fifthMethod += 1;
  }

  @ws.disconnect()
  onDisconnect() {
    this.calledMethods.onDisconnect += 1;
  }
}
