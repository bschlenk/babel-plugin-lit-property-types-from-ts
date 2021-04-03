class MyClass {
  @property({
    type: Array,
  })
  array1: Array<string>;
  @property({
    type: Array,
  })
  array2: string[];
  @property({
    type: Array,
  })
  array3: [string, number, boolean];
}
