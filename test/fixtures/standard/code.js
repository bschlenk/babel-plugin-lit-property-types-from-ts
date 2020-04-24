interface MyInterface {}

class MyElement extends LitElement {
  @property()
  myField: string;

  @property()
  expanded: boolean;

  @property({ type: Number })
  someValue: string;

  @property({ attribute: 'another-field' })
  anotherField: number;

  @property()
  field5: string[];

  @property()
  field6: 'value';

  @property()
  field7: MyInterface;

  @property()
  field8: { prop: string };

  @property()
  field9: 'blue' | 'green' | 'red';
}
