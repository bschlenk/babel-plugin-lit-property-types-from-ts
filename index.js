/**
 * This plugin DRYs up lit-element's `property` decorator by automatically
 * determining the value for `type` based on the decorated field's TS type
 * annotation.
 *
 * `String` types are omitted since this is the default.
 *
 * This plugin will not override explicitly set `type` values.
 *
 * Example input:
 *
 * ```js
 * class MyElement extends LitElement {
 *   @property()
 *   prop1: string;
 *
 *   @property()
 *   prop2: boolean;
 *
 *   @property()
 *   prop3: number;
 *
 *   @property()
 *   prop4: MyObject[];
 *
 *   @property()
 *   prop5 = false;
 * }
 * ```
 *
 * Example output:
 *
 * ```js
 * class MyElement extends LitElement {
 *   @property()
 *   prop1: string;
 *
 *   @property({ type: Boolean })
 *   prop2: boolean;
 *
 *   @property({ type: Number })
 *   prop3: number;
 *
 *   @property({ type: Array })
 *   prop4: MyObject[];
 *
 *   @property({ type: Boolean })
 *   prop5 = false;
 * }
 * ```
 */

const { kebabCase, upperFirst } = require('lodash');

module.exports = function (babel) {
  const t = babel.types;

  return {
    visitor: {
      // we must start from `Program`, otherwise the TS plugin will strip out
      // types before we have a chance to look at them
      Program(path) {
        path.traverse({
          'ClassProperty|ClassMethod'(path) {
            const decoratorExpression = findDecoratorCallExpression(
              path.node,
              'property',
            );

            if (!decoratorExpression) {
              // node doesn't have a `property` decorator
              // that is a CallExpression
              return;
            }

            if (decoratorExpression.arguments.length > 1) {
              throw path.buildCodeFrameError(
                `Expected @property decorator to have at most 1 argument, ` +
                  `but found ${decoratorExpression.arguments.length}`,
              );
            }

            let decoratorObj = decoratorExpression.arguments[0];

            if (getObjectProperty(decoratorObj, 'type')) {
              // this property already has a `type` value, skip it
              return;
            }

            const type = determineType(path.node);
            if (!type) {
              throw path.buildCodeFrameError(
                `Could not determine the type for this @property ` +
                  `decorated field, please explicity add a type`,
              );
            }

            if (type === 'String') {
              // `String` is the default type for lit-element properties, we can
              // omit it
              return;
            }

            // if the decorator didn't already have an options argument, we have
            // to create it first
            if (!decoratorObj) {
              decoratorObj = t.objectExpression([]);
              decoratorExpression.arguments.push(decoratorObj);
            }

            decoratorObj.properties.push(
              createObjectProperty('type', t.identifier(type)),
            );
          },
        });
      },
    },
  };

  function findDecoratorCallExpression(node, name) {
    if (!node.decorators) {
      return undefined;
    }

    const decorator = node.decorators.find(
      (d) =>
        d.expression.type === 'CallExpression' &&
        d.expression.callee.name === name,
    );

    // TODO: should we throw if we encounter a @property decorator that isn't a
    // call expression? That would most likely be a bug...
    return decorator ? decorator.expression : undefined;
  }

  function getObjectProperty(obj, attr) {
    if (!obj) return undefined;
    return obj.properties.find((p) => p.key.name === attr);
  }

  function createObjectProperty(key, value) {
    return t.objectProperty(t.identifier(key), value);
  }

  function determineType(node) {
    if (t.isClassMethod(node)) {
      // @property decorator can be placed on a `getter` class method
      if (node.kind === 'get' && node.returnType) {
        return determineTypeFromTypeAnnotation(node.returnType.typeAnnotation);
      }
      return null;
    }

    if (node.typeAnnotation) {
      return determineTypeFromTypeAnnotation(
        node.typeAnnotation.typeAnnotation,
      );
    }

    if (node.value) {
      return determineTypeFromNodeValue(node.value);
    }

    return null;
  }

  function determineTypeFromTypeAnnotation(node) {
    if (t.isTSStringKeyword(node)) {
      // field: string
      return 'String';
    }

    if (t.isTSNumberKeyword(node)) {
      // field: number
      return 'Number';
    }

    if (t.isTSBooleanKeyword(node)) {
      // field: boolean
      return 'Boolean';
    }

    if (t.isTSArrayType(node)) {
      // field: string[]
      return 'Array';
    }

    if (t.isTSLiteralType(node)) {
      // field: 'value';
      // field: true;
      const value = node.literal.value;
      const type = typeof value;
      return upperFirst(type);
    }

    if (t.isTSTypeReference(node) || t.isTSTypeLiteral(node)) {
      // field: MyInterface;
      // field: { prop: string };
      return 'Object';
    }

    if (t.isTSUnionType(node)) {
      // field: 'blue' | 'green' | 'red';
      return allSameOrNull(node.types, determineTypeFromTypeAnnotation);
    }

    return null;
  }

  function determineTypeFromNodeValue(node) {
    const type = [
      [t.isStringLiteral, 'String'],
      [t.isNumericLiteral, 'Number'],
      [t.isBooleanLiteral, 'Boolean'],
      [t.isObjectExpression, 'Object'],
      [t.isArrayExpression, 'Array'],
    ].find((cfg) => cfg[0](node));

    return type ? type[1] : undefined;
  }

  function allSameOrNull(values, convert) {
    const [first, ...rest] = values;
    const converted = convert(first);

    for (const val of rest) {
      if (converted !== convert(val)) {
        return null;
      }
    }

    return converted;
  }
};
