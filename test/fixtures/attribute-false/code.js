class MyElement extends LitElement {
  @property()
  attributeField: boolean;

  @property({ attribute: false })
  nonAttributeField: boolean;
}
