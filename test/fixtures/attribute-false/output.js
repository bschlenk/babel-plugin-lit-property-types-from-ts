class MyElement extends LitElement {
  @property({
    type: Boolean,
  })
  attributeField: boolean;
  @property({
    attribute: false,
  })
  nonAttributeField: boolean;
}
