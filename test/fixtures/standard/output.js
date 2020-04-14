class MyElement extends LitElement {
  @property({
    type: String,
    attribute: 'my-field',
    reflect: true,
  })
  myField: string;
  @property({
    type: Boolean,
    reflect: true,
  })
  expanded: boolean;
  @property({
    type: Number,
    attribute: 'some-value',
    reflect: true,
  })
  someValue: string;
}
