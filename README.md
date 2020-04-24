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
`any`, `string | number`, or `'red' | 'green' | false | 42`, then we'll throw
an exception unless you've manually specified the `type`.

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
