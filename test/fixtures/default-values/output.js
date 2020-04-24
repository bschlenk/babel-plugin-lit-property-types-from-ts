export class MyClass extends LitElement {
  @property()
  field1 = 'abc';
  @property({
    type: Boolean,
  })
  field2 = true;
  @property({
    type: Number,
  })
  field3 = 42;
  @property({
    type: Array,
  })
  field4 = [1, 2, 3];
  @property({
    type: Object,
  })
  field5 = {
    a: 'abc',
    b: 'def',
  };
}
