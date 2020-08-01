# babel-plugin-lit-property-types-from-ts

Ever get tired of having to write the type of a lit property twice, once in the
property decorator, and again in TypeScript? This plugin automatically
determines the right value for a property's `type` based on the field's type
annotation. If a default value is set, and the type annotation is omitted
(thanks TS for automatic type inferences!), then the `type` will be set based on
a `typeof` check against the default value.

Lit-element will use its built in `String` converter if `type` is omitted, so
we'll only add `type` if your property is not a string (reducing bundle size!).

If you don't think the inferred `type` would be correct, you can manually supply
the `type` and this plugin will leave it alone.

If the type can't be inferred, say because your field has the type annotation
`any`, `string | number`, or `'red' | 'green' | false | 42`, then we'll throw an
exception unless you've manually specified the `type`.

## Usage

Install as a dev dependency:

```bash
npm install -D babel-plugin-lit-property-types-from-ts
```

Add it to your babel config file as a plugin - you'll also need
[@babel/preset-typescript] (or [@babel/plugin-syntax-typescript] if you don't
intend to use babel to transpile typescript),
[@babel/plugin-proposal-class-properties], and
[@babel/plugin-proposal-decorators]:

```js
// .babelrc.js or babel.config.js
module.exports = {
  plugins: [
    ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
    '@babel/plugin-proposal-class-properties',
    'babel-plugin-lit-property-types-from-ts',
  ],

  presets: ['@babel/preset-typescript'],
};
```

## Examples

Infer `type` from type annotation

```js
// In
@property()
field: boolean;

// Out
@property({ type: Boolean })
field: boolean;
```

---

Leave explicitly set `type` alone

```js
// In
@property({ type: String })
field: boolean;

// Out
@property({ type: String })
field: boolean;
```

---

Infer `type` from default value

```js
// In
@property()
field = false;

// Out
@property({ type: Boolean })
field = false;
```

---

Infer `type` as `Array`

```js
// In
@property()
field: MyType[];

// Out
@property({ type: Array })
field: MyType[];
```

[@babel/preset-typescript]: https://babeljs.io/docs/en/babel-preset-typescript
[@babel/plugin-syntax-typescript]:
  https://babeljs.io/docs/en/next/babel-plugin-syntax-typescript.html
[@babel/plugin-proposal-class-properties]:
  https://babeljs.io/docs/en/babel-plugin-proposal-class-properties
[@babel/plugin-proposal-decorators]:
  https://babeljs.io/docs/en/babel-plugin-proposal-decorators
