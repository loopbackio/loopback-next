// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {ContextGraph} from '../..';

describe('ContextGraph', () => {
  let app: Context;
  let server: Context;

  beforeEach(givenContexts);

  it('creates a dot graph without bindings', () => {
    const json = server.inspect();
    const graph = new ContextGraph(json);
    const dot = graph.render();
    expect(dot).to.eql(`digraph "ContextGraph" {
  subgraph "cluster_app" {
    label = "app";
    labelloc = "t";
    subgraph "cluster_server" {
      label = "server";
      labelloc = "t";
    }
  }
}`);
  });

  it('creates a dot graph without parent', () => {
    const json = server.inspect({includeParent: false});
    const graph = new ContextGraph(json);
    const dot = graph.render();
    expect(dot).to.eql(`digraph "ContextGraph" {
  subgraph "cluster_server" {
    label = "server";
    labelloc = "t";
  }
}`);
  });

  it('creates a dot graph with bindings', () => {
    server.bind('port').to(3000);
    app.bind('now').toDynamicValue(() => new Date());
    const json = server.inspect();
    const graph = new ContextGraph(json);
    const dot = graph.render();
    expect(dot).to.eql(`digraph "ContextGraph" {
  subgraph "cluster_app" {
    label = "app";
    labelloc = "t";
    "Binding_0_0" [
      label = "{now|{DynamicValue|Transient}}",
      shape = "record",
      style = "filled,rounded",
      fillcolor = "cyan3",
    ];
    subgraph "cluster_server" {
      label = "server";
      labelloc = "t";
      "Binding_1_0" [
        label = "{port|{Constant|Transient}}",
        shape = "record",
        style = "filled,rounded",
        fillcolor = "cyan3",
      ];
    }
  }
}`);
  });

  it('creates a dot graph with class bindings excluding injections', () => {
    class Logger {
      @inject('now')
      date: Date;
      constructor(@inject('host') private host: string) {}
    }
    server.bind('host').to('localhost');
    server.bind('server.logger').toClass(Logger);
    app.bind('now').toDynamicValue(() => new Date());
    const json = server.inspect({includeInjections: false});
    const graph = new ContextGraph(json);
    const dot = graph.render();
    expect(dot).to.eql(`digraph "ContextGraph" {
  "Class_Logger" [
    label = "Logger",
    style = "filled",
    shape = "record",
    fillcolor = "khaki",
  ];
  subgraph "cluster_app" {
    label = "app";
    labelloc = "t";
    "Binding_0_0" [
      label = "{now|{DynamicValue|Transient}}",
      shape = "record",
      style = "filled,rounded",
      fillcolor = "cyan3",
    ];
    subgraph "cluster_server" {
      label = "server";
      labelloc = "t";
      "Binding_1_0" [
        label = "{host|{Constant|Transient}}",
        shape = "record",
        style = "filled,rounded",
        fillcolor = "cyan3",
      ];
      "Binding_1_1" [
        label = "{server.logger|{Class|Transient}}",
        shape = "record",
        style = "filled,rounded",
        fillcolor = "cyan3",
      ];
      "Binding_1_1" -> "Class_Logger" [
        style = "dashed",
      ];
    }
  }
}`);
  });

  it('creates a dot graph with class bindings including injections', () => {
    class Logger {
      @inject('now')
      date: Date;
      constructor(@inject('host') private host: string) {}
    }
    server.bind('host').to('localhost');
    server.bind('server.logger').toClass(Logger);
    app.bind('now').toDynamicValue(() => new Date());
    const json = server.inspect({includeInjections: true});
    const graph = new ContextGraph(json);
    const dot = graph.render();
    expect(dot).to.eql(`digraph "ContextGraph" {
  "Class_Logger" [
    label = "Logger|{[0]|date}",
    style = "filled",
    shape = "record",
    fillcolor = "khaki",
  ];
  subgraph "cluster_app" {
    label = "app";
    labelloc = "t";
    "Binding_0_0" [
      label = "{now|{DynamicValue|Transient}}",
      shape = "record",
      style = "filled,rounded",
      fillcolor = "cyan3",
    ];
    subgraph "cluster_server" {
      label = "server";
      labelloc = "t";
      "Binding_1_0" [
        label = "{host|{Constant|Transient}}",
        shape = "record",
        style = "filled,rounded",
        fillcolor = "cyan3",
      ];
      "Binding_1_1" [
        label = "{server.logger|{Class|Transient}}",
        shape = "record",
        style = "filled,rounded",
        fillcolor = "cyan3",
      ];
      "Binding_1_1" -> "Class_Logger" [
        style = "dashed",
      ];
      "Class_Logger" -> "Binding_1_0" [
        color = "blue",
      ];
      "Class_Logger" -> "Binding_0_0" [
        color = "blue",
      ];
    }
  }
}`);
  });
  function givenContexts() {
    app = new Context('app');
    server = new Context(app, 'server');
  }
});
