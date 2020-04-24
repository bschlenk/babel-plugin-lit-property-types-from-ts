interface MyInterface {}

class MyElement extends LitElement {
  @property()
  myField: string;
  @property({
    type: Boolean,
  })
  expanded: boolean;
  @property({
    type: Number,
  })
  someValue: string;
  @property({
    attribute: 'another-field',
    type: Number,
  })
  anotherField: number;
  @property({
    type: Array,
  })
  field5: string[];
  @property()
  field6: 'value';
  @property({
    type: Object,
  })
  field7: MyInterface;
  @property({
    type: Object,
  })
  field8: {
    prop: string,
  };
  @property()
  field9: 'blue' | 'green' | 'red';
}
