class MyElement extends LitElement {
  @property()
  get myField(): string {
    return this._val;
  }
}
