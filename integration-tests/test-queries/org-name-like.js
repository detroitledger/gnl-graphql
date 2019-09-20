export const query = `
query orgNameLike {
  organizations(nameLike: "%organization 9%", limit: 11) {
    name
  }
}
`;

export const expected = {
  data: {
    organizations: [
      { name: 'test organization 9' },
      { name: 'test organization 90' },
      { name: 'test organization 91' },
      { name: 'test organization 92' },
      { name: 'test organization 93' },
      { name: 'test organization 94' },
      { name: 'test organization 95' },
      { name: 'test organization 96' },
      { name: 'test organization 97' },
      { name: 'test organization 98' },
      { name: 'test organization 99' },
    ],
  },
};
