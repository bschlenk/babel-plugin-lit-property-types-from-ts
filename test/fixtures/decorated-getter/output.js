class MyElement extends LitElement {
  @property({
    type: String,
    attribute: 'my-field',
    reflect: true,
  })
  get myField(): string {
    return this._val;
  }
}
