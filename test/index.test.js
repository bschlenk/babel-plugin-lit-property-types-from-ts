const path = require('path');
const pluginTester = require('babel-plugin-tester').default;
const plugin = require('..');

pluginTester({
  plugin,
  pluginName: 'lit-property-types-from-ts',
  babelOptions: {
    plugins: [
      '@babel/plugin-syntax-typescript',
      '@babel/plugin-syntax-class-properties',
      ['@babel/plugin-syntax-decorators', { decoratorsBeforeExport: true }],
    ],
  },
  snapshot: true,
  fixtures: path.resolve(__dirname, 'fixtures'),
  tests: [
    {
      title: 'multiple property args',
      code: `
        class MyElement extends LitElement {
          @property('abc', 'def')
          get myField(): string {
            return this._val;
          }
        }
      `,
      error:
        'Expected @property decorator to have at most 1 argument, but found 2',
      snapshot: false,
    },
    {
      title: 'cannot determine type',
      code: `
        class MyElement extends LitElement {
          @property()
          get MyField() {}
        }
      `,
      error:
        'Could not determine the type for this @property decorated field, please explicity add a type',
      snapshot: false,
    },
    {
      title: 'cannot determine type - no information',
      code: `
        class MyElement extends LitElement {
          @property()
          field;
        }
      `,
      error:
        'Could not determine the type for this @property decorated field, please explicity add a type',
      snapshot: false,
    },
    {
      title: 'cannot determine type - unrecognized type annotation',
      code: `
        class MyElement extends LitElement {
          @property()
          field: any;
        }
      `,
      error:
        'Could not determine the type for this @property decorated field, please explicity add a type',
      snapshot: false,
    },
    {
      title: 'cannot determine type - union of multiple types',
      code: `
        class MyElement extends LitElement {
          @property()
          field: 'blue' | 'green' | 42 | true;
        }
      `,
      error:
        'Could not determine the type for this @property decorated field, please explicity add a type',
      snapshot: false,
    },
    {
      title: 'cannot determine type - unknown default value',
      code: `
        class MyElement extends LitElement {
          @property()
          field = new Date();
        }
      `,
      error:
        'Could not determine the type for this @property decorated field, please explicity add a type',
      snapshot: false,
    },
  ],
});
