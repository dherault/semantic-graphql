const assignTypeAndId = type => x => Object.assign({ type, id: x.text }, x);

const comments = [
  { text: 'zeroth comment' },
  { text: 'first comment' },
  { text: 'second comment' },
  { text: 'third comment' },
  { text: 'fourth comment' },
  { text: 'fifth comment' },
  { text: 'sixth comment' },
  { text: 'seventh comment' },
  { text: 'eighth comment' },
  { text: 'ninth comment' },
  { text: 'tenth comment' },
  { text: 'eleventh comment' },
  { text: 'twelfth comment' },
  { text: 'thirteenth comment' },
  { text: 'fourteenth comment' },
  { text: 'fifteenth comment' },
  { text: 'sixteenth comment' },
  { text: 'seventeenth comment' },
  { text: 'eighteenth comment' },
  { text: 'nineteenth comment' },
].map(assignTypeAndId('Comment')); // type is useless for this example

module.exports = [
  {
    id: 'cool_article',
    type: 'Article',
    // The reference is usualy on the child, this can be done using owl:inverseOf
    // foo:hasComments owl:inverseOf foo:belongsToArticle (where foo:belongsToArticle has foo:Comment in its domain)
    // The lib would resolve foo:hasComments on foo:Article using the reference on foo:Comment instances
    // Here none of it is required since we just want to display how to handle relay connections
    hasComments: comments.map(c => c.id),
  },
  ...comments,
];
