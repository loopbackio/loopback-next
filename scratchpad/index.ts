import {Application, Sequence} from '@loopback/core';
import {WebPack} from '@loopback/webpack';
import {Compression, userRole} from '@loopback/compression';
import {Authentication, injectUser, injectAuthenticate} from '@loopback/authentication';
import {Authorization, injectAuthorize} from '@loopback/authorization';
import {Rejection} from '@loopback/rejection';
import {Todo} from './components/todo';

const app = new Application({
  sequence: TodoSequence,
  components: [Todo, Authentication, Authorization, Rejection, WebPack]
});

class TodoSequence extends Sequence {
  constructor(
    public @injectSend() send,
    public @injectAuthenticate() authenticate,
    public @injectAuthorize() authorize,
    public @injectReject() reject
  ) {}
}