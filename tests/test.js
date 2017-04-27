'use strict';

const fs = require('fs');
const DIContainer = require('../lib/DIContainer');

test('build container [with default options]', () => {
  const container = new DIContainer(['services'], {
    baseDir: __dirname,
  });
  expect(container).toBeInstanceOf(DIContainer);

  const context = container.build();
  expect(context.substr(context.lastIndexOf('/') + 1)).toBe('.context.js');

  const di = fs.readFileSync(context).toString();
  expect(di).toBe(fs.readFileSync(__dirname + '/expected.defaults.js').toString());

  if (fs.existsSync(context)) {
    fs.unlinkSync(context);
  }
});

test('build container [with specified options]', () => {
  const logger = message => message; // fake logger
  const container = new DIContainer(['services'], {
    baseDir: __dirname,
    contextDir: __dirname + '/context',
    contextName: 'di.js',
    logger: logger,
  });
  expect(container).toBeInstanceOf(DIContainer);

  const context = container.build();
  expect(context.substr(context.lastIndexOf('/') + 1)).toBe('di.js');

  const di = fs.readFileSync(context).toString();
  expect(di).toBe(fs.readFileSync(__dirname + '/expected.options.js').toString());

  if (fs.existsSync(context)) {
    fs.unlinkSync(context);
  }
});
