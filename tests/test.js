'use strict';

const fs = require('fs');
const MikroDI = require('../lib/MikroDI');

describe('MikroDI', () => {

  it('should build container with default options', () => {
    const container = MikroDI.init(['services'], {
      baseDir: __dirname,
    });
    expect(container).toBeInstanceOf(MikroDI);

    const context = container.build();
    expect(context.substr(context.lastIndexOf('/') + 1)).toBe('.context.js');

    const di = fs.readFileSync(context).toString();
    expect(di).toBe(fs.readFileSync(__dirname + '/expected.defaults.js').toString());

    if (fs.existsSync(context)) {
      fs.unlinkSync(context);
    }
  });

  it('should build container with specified options', () => {
    const logger = message => message; // fake logger
    const container = MikroDI.init(['services'], {
      baseDir: __dirname,
      contextDir: __dirname + '/context',
      contextName: 'di.js',
      logger: logger,
    });
    expect(container).toBeInstanceOf(MikroDI);

    const context = container.build();
    expect(context.substr(context.lastIndexOf('/') + 1)).toBe('di.js');

    const di = fs.readFileSync(context).toString();
    expect(di).toBe(fs.readFileSync(__dirname + '/expected.options.js').toString());

    if (fs.existsSync(context)) {
      fs.unlinkSync(context);
    }
  });

});
