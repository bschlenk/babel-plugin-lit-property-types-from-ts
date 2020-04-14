/**
 * This plugin DRYs up lit-element's `property` decorator by adding the
 * following sugar:
 *
 * The `type` option is automatically determined by TypeScript type of the
 * decorated field. The correct type is inferred even when omitting the type
 * annotation when setting default values.
 *
 * The `attribute` option is automatically set if the decorated field is
 * camelCase - it will be set to the kebab-case form of the field.
 *
 * The `reflect` option is automatically set for values with primitive types,
 * i.e. string, number, & boolean.
 *
 * This plugin will not override explicitly set `type`, `attribute`, and
 * `reflect` options, allowing for explicit overrides if needed.
 *
 * Example input:
 *
 * ```js
 * class MyElement extends LitElement {
 *   @property()
 *   myField: string;
 *
 *   @property()
 *   expanded: boolean;
 *
 *   @property({ type: Number })
 *   someValue: string;
 * }
 * ```
 *
 * Example output:
 *
 * ```js
 * class MyElement extends LitElement {
 *   @property({ type: String, attribute: 'my-field', reflect: true })
 *   myField: string;
 *
 *   @property({ type: Boolean, reflect: true })
 *   expanded: boolean;
 *
 *   @property({ type: Number, attribute: 'some-value', reflect: true })
 *   someValue: string;
 * }
 * ```
 */

const { kebabCase, upperFirst } = require('lodash');

module.exports = function (babel) {
  const t = babel.types;

  return {
    visitor: {
      Program(path) {
        path.traverse({
          'ClassProperty|ClassMethod'(path) {
            const decoratorExpression = findDecoratorCallExpression(
              path.node,
              'property',
            );

            if (!decoratorExpression) {
              // node doesn't have a `property` decorator that is a CallExpression
              return;
            }

            if (decoratorExpression.arguments.length > 1) {
              throw path.buildCodeFrameError(
                `Expected @property decorator to have at most 1 argument, but found ${decoratorExpression.arguments.length}`,
              );
            }

            // Create the decorator object arg if it does not exist
            let decoratorObj = decoratorExpression.arguments[0];
            if (!decoratorObj) {
              decoratorObj = t.objectExpression([]);
              decoratorExpression.arguments.push(decoratorObj);
            }

            // If the `@property` decorator is missing a `type` property, and
            // the class property has either a type annotation or a default
            // value, determine the js type (i.e. the primitive constructor) and
            // add it as the `type` property.
            if (!getObjectProperty(decoratorObj, 'type')) {
              const type = determineType(path.node);
              if (type) {
                decoratorObj.properties.push(
                  createObjectProperty('type', t.identifier(type)),
                );
              } else {
                throw path.buildCodeFrameError(
                  `Could not determine the type for this @property decorated field, please explicity add a type`,
                );
              }
            }

            // If the `@property` decorator is missing an `attribute` property,
            // and the class property name is camelCase, add the `attribute`
            // property with the kebab-cased value.
            //
            // TODO: can use
            // https://github.com/Polymer/lit-element/blob/master/src/lib/updating-element.ts#L436
            if (!getObjectProperty(decoratorObj, 'attribute')) {
              const propName = path.node.key.name;
              const attrName = kebabCase(propName);
              if (propName !== attrName) {
                decoratorObj.properties.push(
                  createObjectProperty('attribute', t.stringLiteral(attrName)),
                );
              }
            }

            if (!getObjectProperty(decoratorObj, 'reflect')) {
              const typeProp = getObjectProperty(decoratorObj, 'type');

              if (typeProp) {
                const type = typeProp.value.name;
                if (shouldReflectProperty(type)) {
                  decoratorObj.properties.push(
                    createObjectProperty('reflect', t.booleanLiteral(true)),
                  );
                }
              }
            }
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

    return decorator ? decorator.expression : undefined;
  }

  function getObjectProperty(obj, attr) {
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

  function shouldReflectProperty(type) {
    return ['String', 'Number', 'Boolean'].includes(type);
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
