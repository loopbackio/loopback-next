import {Component} from '@loopback/core';
import {Lb3AppBooter} from './lb3app.booter';

export class Lb3AppBooterComponent implements Component {
  booters = [Lb3AppBooter];
}
