# loopback-next-hello-world

[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/strongloop/loopback) [![Build Status](https://travis-ci.org/strongloop/loopback-next-quick-start.svg?branch=master)](https://travis-ci.org/strongloop/loopback-next-quick-start) [TODO Code coverage - coveralls]

## Table of Contents
* [Overview](#overview)
* [Setup](#setup)
* [Testing](#testing)
* [Project Structure](#structure)
* [TypeScript Configuration](#typescriptConfiguration)
* [Dependencies](#dependencies)
* [Other Resources](#resources)
* [Contribute](#contribute)

## <a name="overview"></a>Overview

#### Welcome to the quick start tutorial for Loopback.next + TypeScript!
Loopback makes it easy to build modern applications that require complex integrations. 

Loopback.next is the next version of LoopBack and is being designed to make it even easier to extend the framework for your own needs and will enable the latest ES features.

The goal of this tutorial is to show you what a basic, 'hello-world' Loopback.next app looks like and how it works.

This example will show you how to: 

* create a Loopback.next server
* make a request to the server to fetch content

This example will explain:

* the structure of a Loopback.next application
* how to add a custom component (TK)
* how add a custom sequence (TK)

When you have this example installed and running, you will be able to make a request to the server with a name and get back a HTTP 200 response: 

[TODO: add screenshot of output here]

## <a name="setup"></a>Setup 

1. Install `node`, `npm`, and `TypeScript` 

	You should have `node` (>= 7.6.0), `npm` (>= 3.10), and `TypeScript`  (>= 2.0.0) installed. 
	
	For the latest information on project dependencies for LoopBack, please check this link: 
[https://github.com/strongloop/loopback-next/wiki/Installation](https://github.com/strongloop/loopback-next/wiki/Installation).

2. Clone this repo: 
	
	`git clone https://github.com/strongloop/loopback-next-hello-world.git`

3. Switch to your new directory: 
	
	`cd loopback-next-hello-world`

4. Install your dependencies: 

	```
npm install -S @loopback/core
npm install
```

5. Start the application! 
	
	`npm start`

> Note: `npm start` automatically builds the project via the `prestart` npm script in `package.json`. If you would like to build this project separately, use `npm run build`.


## <a name="testing"></a>Testing

To test this application use `npm test`.

## <a name="structure"></a>Project structure

A TypeScript project will have separate `src` and `dist` directories, for source and distributable files. TypeScript (.ts) files from your `src` folder are compiled into JavaScript (.js) files and output in the `dist` folder.  

| Name | Description|
|------|------------|
|README.md|this file you're reading right now!|
|dist|this directory contains the distributable code built by TypeScript. This is the code you deploy.|
|node_modules|this directory contains your npm modules|
|package.json	|------------|
|src|this directory contains your source code. TypeScript compiles this code and outputs it to the `dist/` directory.|
|src/application.ts|------------|
|src/components|------------|
|src/components/controllers|------------|
|src/components/controllers/hello-world.api.ts|the Open API Spec file|
|src/components/controllers/hello-world.ts|------------|
|src/components/index.ts|------------|
|src/index.ts|------------|
|test/|this directory contains your tests|
|tsconfig.json|the configuration settings for TypeScript compilation|

### <a name="typescriptConfiguration"></a>TypeScript Configuration

[TODO]
In your `tsconfig.json` file, you can specify options for TypeScript to use when compiling your project. 

Here is the `tsconfig.json` for this project: 

```json{
  "compilerOptions": {                     
    "module": "commonjs",
    "target": "es6",
    "outDir": "./dist",
    "experimentalDecorators": true,
    "baseUrl": "./src"    
  },
  "exclude": [
    "node_modules/**"
  ]
}
```
| compilerOption | Description |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `"module": "commonjs"`             | The **output** module type (in your `.js` files). Node uses commonjs, so that is what we use          |
| `"target": "es6"`                  | The output language level                               |
| `"outDir": "./dist"`                 | Location to output `.js` files                                                        |
| `"baseUrl": "./src"`                   |  |
| `experimentalDecorators`                     | enables support for decorators (more information: https://www.typescriptlang.org/docs/handbook/decorators.html)|

### A note about editors
We recommend you use [VSCode](https://code.visualstudio.com/) for this quick start because it has built-in TypeScript support, but you can use any editor. For more information about using TypeScript with your editor of choice, check out https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support.

[TODO add a Need more help? link]

## <a name="dependencies"></a>Dependencies

[TODO]

## <a name="resources"></a>Other Resources
* Current [Loopback documentation](http://loopback.io)
* [Loopback.next repo](https://github.com/strongloop/loopback-next)
* Check out the [Strongloop blog](https://strongloop.com/strongblog/tag_LoopBack.html) for more posts about Loopback
* To keep up-to-date with Loopback announcements, sign up for the Strongloop newsletter [here](https://strongloop.com/newsletter/).

## <a name="contribute"></a>Contribute to Loopback
* [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing#guidelines)
* [Join the team](https://github.com/strongloop/loopback-next/issues/110)