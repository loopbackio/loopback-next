// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {socketio} from '../../../decorators';

export const METHODS_TEST_CONTROLER_NSP = '/with-methods/ws';

@socketio(METHODS_TEST_CONTROLER_NSP)
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
  @socketio.connect()
  onConnectOne() {
    this.calledMethods.onConnectOne += 1;
  }

  @socketio.connect()
  onConnectTwo() {
    this.calledMethods.onConnectTwo += 1;
  }

  @socketio.subscribe('firstEventName1', 'firstEventName2')
  firstMethod() {
    this.calledMethods.firstMethod += 1;
  }

  @socketio.subscribe('secondEventName', /^otherSecondEventName$/)
  secondMethod() {
    this.calledMethods.secondMethod += 1;
  }

  @socketio.subscribe('thirdEventName')
  thirdMethod() {
    this.calledMethods.thirdMethod += 1;
  }

  @socketio.subscribe(
    'firstEventName1',
    'firstEventName2',
    'secondEventName',
    /^otherSecondEventName$/,
    'thirdEventName',
  )
  topMethods() {
    this.calledMethods.topMethods += 1;
  }

  @socketio.subscribe(/^fourthEventName$/)
  fourthMethod1() {
    this.calledMethods.fourthMethod1 += 1;
  }

  @socketio.subscribe(/^fourthEventName$/)
  fourthMethod2() {
    this.calledMethods.fourthMethod2 += 1;
  }

  @socketio.subscribe(/^fifthEventName$/)
  fifthMethod() {
    this.calledMethods.fifthMethod += 1;
  }

  @socketio.disconnect()
  onDisconnect() {
    this.calledMethods.onDisconnect += 1;
  }
}
