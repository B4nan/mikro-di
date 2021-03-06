'use strict';

const fs = require('fs');
const MikroDI = require('../lib/MikroDI');
const CycleFinder = require('../lib/CycleFinder');

describe('MikroDI', () => {

  describe('Container', () => {
    it('should build container with default options', () => {
      MikroDI.init(['services'], {
        baseDir: __dirname,
        services: {
          scalarService: `YourFunkyDependency2('funky-namespace')`,
        },
      });
      expect(MikroDI.container).toBeInstanceOf(MikroDI);
      expect(MikroDI.context.substr(MikroDI.context.lastIndexOf('/') + 1)).toBe('.context.js');

      const di = fs.readFileSync(MikroDI.context).toString();
      expect(di).toBe(fs.readFileSync(__dirname + '/expected.defaults.js').toString());

      if (fs.existsSync(MikroDI.context)) {
        fs.unlinkSync(MikroDI.context);
      }
    });

    it('should build container with specified options', () => {
      const logger = message => message; // fake logger
      MikroDI.init(['services'], {
        baseDir: __dirname,
        contextDir: __dirname + '/context',
        contextName: 'di.js',
        logger: logger,
        services: {
          scalarService: `YourFunkyDependency2('funky-namespace')`,
        },
      });
      expect(MikroDI.container).toBeInstanceOf(MikroDI);
      expect(MikroDI.context.substr(MikroDI.context.lastIndexOf('/') + 1)).toBe('di.js');

      const di = fs.readFileSync(MikroDI.context).toString();
      expect(di).toBe(fs.readFileSync(__dirname + '/expected.options.js').toString());

      if (fs.existsSync(MikroDI.context)) {
        fs.unlinkSync(MikroDI.context);
      }
    });

    it('should throw error when there is a cycle', () => {
      expect(() => {
        MikroDI.init(['services-w-cycle'], {
          baseDir: __dirname,
          contextName: 'di-cycle.js',
        });
      }).toThrow(`MikroDI: Cyclic dependency found at 'YourFunkyDependency1 -> YourFunkyService2 -> YourFunkyDependency1'!`);
    });
  });

  describe('CycleFinder', () => {
    it('should find cycle [A -> B -> A]', () => {
      const cf = new CycleFinder({
        A: {dependencies: ['B', 'C']},
        B: {dependencies: ['D', 'A']},
        C: {dependencies: []},
        D: {dependencies: []},
      });
      expect(cf.hasCycle()).toBe(true);
      expect(cf.getFoundCycle()).toEqual(['A', 'B', 'A']);
    });

    it('should find cycle [A -> B -> C -> B]', () => {
      const cf = new CycleFinder({
        A: {dependencies: ['B', 'C']},
        B: {dependencies: ['D', 'C']},
        C: {dependencies: ['B']},
        D: {dependencies: []},
      });
      expect(cf.hasCycle()).toBe(true);
      expect(cf.getFoundCycle()).toEqual(['A', 'B', 'C', 'B']);
    });

    it('should find cycle [A -> B -> C -> D -> B]', () => {
      const cf = new CycleFinder({
        A: {dependencies: ['UndefinedDependency', 'B']},
        B: {dependencies: ['C']},
        C: {dependencies: ['D']},
        D: {dependencies: ['B']},
      });
      expect(cf.hasCycle()).toBe(true);
      expect(cf.getFoundCycle()).toEqual(['A', 'B', 'C', 'D', 'B']);
      expect(cf.getFoundCycle('->')).toEqual('A->B->C->D->B');
    });
  });

});
