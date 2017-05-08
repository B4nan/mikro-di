# mikro-di

Simple ES6 DI container for node.js, that honours convention over configuration.
 
It works by discovering given directories and generating a simple DI container 
instance, which is properly type-hinted and allows auto-completion in editors like 
WebStorm or VS Code. 

It also allows to create service definition with scalar constructor parameters 
(e.g. `HttpClient('https://api.example.io')`).

Inspired by https://github.com/nette/di

[![](https://img.shields.io/npm/v/mikro-di.svg)](https://www.npmjs.com/package/mikro-di)
[![](https://img.shields.io/npm/dm/mikro-di.svg)](https://www.npmjs.com/package/mikro-di)
[![Dependency Status](https://david-dm.org/B4nan/mikro-di.svg)](https://david-dm.org/B4nan/mikro-di)
[![Build Status](https://travis-ci.org/B4nan/mikro-di.svg?branch=master)](https://travis-ci.org/B4nan/mikro-di)
[![Coverage Status](https://img.shields.io/coveralls/B4nan/mikro-di.svg)](https://coveralls.io/r/B4nan/mikro-di?branch=master)

## Installation

`$ yarn add mikro-di`
 
or 

`$ npm install mikro-di`

## Usage

DI container should be the first thing you enable in your application, so the right place 
for it is in the `app.js` file. 

**app.js**
```javascript
require('mikro-di').init(['api/services', 'api/repositories']);
```

And then you can require it and use it:

```javascript
const di = require('mikro-di').di;
  
const ret = di.YourFunkyService.process();
console.log(ret);
```

## Registering dependencies

You can declare you service dependencies like this:

```javascript
class YourFunkyService {
  
  /**
   * @param {YourFunkyDependency1} dep1
   * @param {YourFunkyDependency2} dep2
   */
  constructor(dep1, dep2) {
    this.dep1 = dep1;
    this.dep2 = dep2;
  }
  
}
 
// and export it
module.exports = YourFunkyService;
```

Or if you like to you simple objects, you can do this:

```javascript
const YourFunkyService = {
  
  $inject: ['YourFunkyDependency1', 'YourFunkyDependency2'],
  
  /**
   * @param {YourFunkyDependency1} dep1
   * @param {YourFunkyDependency2} dep2
   */
  constructor(dep1, dep2) {
    this.dep1 = dep1;
    this.dep2 = dep2;
  }
  
};
 
// and export it
module.exports = YourFunkyService;
```

When you register you service as ES6 class, you do not need the `$inject` property, 
but the jsdoc with proper type-hinting is required. 
  
If you use plain object export, you can omit the type-hinting of constructor.

## Usage in sails.js controllers

```javascript
const di = require('mikro-di').di;
  
module.exports = {
 
  /** @var {YourFunkyService} funkyService */
  funkyService: di.YourFunkyService,
 
  yourHandler: function (req, res) {
    const data = this.funkyService.process(req);
    res.json(data);
  }
 
};
```

The `@var` annotation is optional. 

## Scalar constructor parameters

When you need to pass a scalar constructor parameter to your service, you can
do so be providing a service definition via `options`: 

```javascript
class YourFunkyDependency2 {
 
  /**
   * @param {String} namespace
   */
  constructor(namespace) {
    this.namespace = namespace;
  }
 
}

module.exports = YourFunkyDependency2;
```

```javascript
const di = require('mikro-di').init(['api/services', 'api/repositories'], {
  services: {
    scalarService: `YourFunkyDependency2('funky-namespace')`,
  },
});
 
console.log(di.scalarService); // YourFunkyDependency2
console.log(di.scalarService.namespace); // 'funky-namespace'
```

The `@var` annotation is optional. 

## Configuration

You can pass your configuration as a second parameter to `mikro-di`:

```javascript
require('mikro-di').init(['api/services', 'api/repositories'], {
  logger: console.log, // defaults to null
  baseDir: '/path/to/your/app', // defaults to `process.cwd()`
  contextDir: '/path/to/your/context', // defaults to `baseDir`
  contextName: 'di.js', // defaults to `.context.js`
});
```

## How does it work

`mikro-di` will discover all paths that you provide as its first parameter and generate
DI context, that you can require and use in your application. It works by loading the contents 
of source files via `fs`, so the file itself is never loaded (required) before you try to access
it from the `di` context. 

The context file is generated in your `baseDir` and is named as `.context.js`. This file should 
be ignored via `.gitignore`, as it is generated code. You can adjust the path where it is stored
via `contextDir` option and the name via `contextName` option.
 
The context file will look like this:

```javascript
module.exports = {
 
  _map: {},
  
  /**
   * @returns {YourFunkyService}
   */
  get YourFunkyService() {
    if (!this._map.YourFunkyService) {
      const YourFunkyService = require('./api/services/AsyncService.js');
      this._map.YourFunkyService = new YourFunkyService(this.YourFunkyDependency1, this.YourFunkyDependency2);
    }
    return this._map.YourFunkyService;
  },
 
  /**
   * @returns {YourFunkyDependency1}
   */
  get YourFunkyDependency1() {
    if (!this._map.YourFunkyDependency1) {
      this._map.YourFunkyDependency1 = require('./api/services/YourFunkyDependency1.js');
    }
    return this._map.YourFunkyDependency1;
  },
 
  /**
   * @returns {YourFunkyDependency2}
   */
  get YourFunkyDependency2() {
    if (!this._map.YourFunkyDependency2) {
      this._map.YourFunkyDependency2 = require('./api/services/YourFunkyDependency2.js');
    }
    return this._map.YourFunkyDependency2;
  },
 
};
```

It basically creates object with ES6 getters that will require you services and its dependencies. 
This way everything is loaded via lazy loading technique. 
