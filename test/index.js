/* global describe, it */
const { assert } = require('chai');
const { GraphQLObjectType, GraphQLInterfaceType } = require('graphql');
const mockResolvers = require('./utils/mockResolvers');
const commonTurtlePrefixes = require('./utils/commonTurtlePrefixes');
const castArrayShape = require('../src/utils/castArrayShape');
const isNil = require('../src/utils/isNil');
const capitalize = require('../src/utils/capitalize');
const { walkmap, walklook } = require('../src/graph/traversal');
const { rdfsClass, rdfType, _rdfsDomain } = require('../src/constants');
const ArrayKeyedMap = require('../src/ArrayKeyedMap');
const SemanticGraph = require('..');

// TODO: split this file

// NOTE: getIriLocalName and isIri will be imported from an external lib someday
describe('Utils', () => {

  it('castArrayShape', () => {
    assert.deepEqual(castArrayShape([0, 1, 2], true), [0, 1, 2]);
    assert.deepEqual(castArrayShape([0, 1, 2], false), 0);
    assert.deepEqual(castArrayShape(0, true), [0]);
    assert.deepEqual(castArrayShape(0, false), 0);
  });

  it('isNil', () => {
    assert.isTrue(isNil(null));
    assert.isTrue(isNil(undefined));
    assert.isTrue(isNil([]));

    assert.isFalse(isNil(''));
    assert.isFalse(isNil(0));
    assert.isFalse(isNil([0]));
  });

  it('capitalize', () => {
    assert.strictEqual(capitalize(''), '');
    assert.strictEqual(capitalize('abc'), 'Abc');
    assert.strictEqual(capitalize('012'), '012');
  });
});

describe('Graph traversal', () => {

  const graph = {
    a: {
      x: ['b', 'c'],
      y: ['d', 'e'],
    },
    b: {
      x: ['a', 'c', 'd'],
      z: ['a', 'f'],
    },
    c: {
      x: ['c'],
    },
    d: {
      y: ['a', 'b'],
      z: ['c'],
    },
    e: {
      z: ['c', 'd', 'g'],
    },
    f: {
      x: ['g'],
    },
    g: {
      y: ['a', 'f'],
    },
  };

  it('walkmap', () => {
    // Walmap should traverse the graph in a depth-first manner
    // using the same exit edge, until all vertices are visited
    assert.deepEqual([...walkmap(graph, 'a', 'x')], ['a', 'b', 'c', 'd']);
    assert.deepEqual([...walkmap(graph, 'b', 'x')], ['b', 'a', 'c', 'd']);
    assert.deepEqual([...walkmap(graph, 'a', 'y')], ['a', 'd', 'b', 'e']);
    assert.deepEqual([...walkmap(graph, 'b', 'y')], ['b']);
    assert.deepEqual([...walkmap(graph, 'b', 'z')], ['b', 'a', 'f']);
  });

  it('walklook', () => {
    // Walklook should traverse the graph in a breath-first manner
    // Stopping once a fringe has resolved a result
    assert.deepEqual([...walklook(graph, 'a', 'x', 'y')], ['d', 'e']);
    assert.deepEqual([...walklook(graph, 'a', 'x', 'z')], ['a', 'f']);
    assert.deepEqual([...walklook(graph, 'g', 'y', 'x')], ['b', 'c', 'g']); // BFS with stop condition
    assert.deepEqual([...walklook(graph, 'g', 'x', 'z')], []);
    assert.deepEqual([...walklook(graph, 'c', 'x', 'z')], []);
  });
});

describe('ArrayKeyedMap', () => {

  it('get/set', () => {
    const akm = new ArrayKeyedMap();

    assert.doesNotThrow(() => akm.set(['a', 'b', 'c'], 'foo'));
    assert.doesNotThrow(() => akm.get(['d']));
    assert.strictEqual(akm.get(['a', 'b', 'c']), 'foo');
    assert.strictEqual(akm.get(['a', 'c', 'b']), 'foo');
    assert.strictEqual(akm.get(['b', 'c', 'a']), 'foo');
    assert.strictEqual(akm.get(['b', 'a', 'c']), 'foo');
    assert.strictEqual(akm.get(['c', 'a', 'b']), 'foo');
    assert.strictEqual(akm.get(['c', 'b', 'a']), 'foo');
  });

  it('has', () => {
    const akm = new ArrayKeyedMap();

    akm.set(['a', 'b', 'c'], 'foo');

    assert.isTrue(akm.has(['a', 'b', 'c']));
    assert.isTrue(akm.has(['a', 'c', 'b']));
    assert.isTrue(akm.has(['b', 'c', 'a']));
    assert.isTrue(akm.has(['b', 'a', 'c']));
    assert.isTrue(akm.has(['c', 'a', 'b']));
    assert.isTrue(akm.has(['c', 'b', 'a']));

    assert.isFalse(akm.has([]));
    assert.isFalse(akm.has(['a']));
    assert.isFalse(akm.has(['a', 'b']));
  });
});

describe('SemanticGraph', () => {

  it('throws when passed incorrect arguments', () => {
    assert.throws(() => new SemanticGraph());
    assert.throws(() => new SemanticGraph('foo'));
    assert.throws(() => new SemanticGraph(mockResolvers, 'foo'));
  });

  it('throws when passed invalid resolvers', () => {
    assert.throws(() => new SemanticGraph({}));
    assert.throws(() => new SemanticGraph(Object.assign({}, mockResolvers, { resolveSourceId: null })));
  });

  it('does not throw when arguments are correct', () => {
    assert.doesNotThrow(() => new SemanticGraph(mockResolvers));
    assert.doesNotThrow(() => new SemanticGraph(mockResolvers, { foo: 'bar' }));
  });

  it('includes the base graph in instances', () => {
    const _ = new SemanticGraph(mockResolvers);

    assert.isObject(_[rdfsClass]);
    assert.isArray(_[rdfsClass][rdfType]);
    assert.include(_[rdfsClass][rdfType], rdfsClass);
  });

  it('exposes API methods', () => {
    const _ = new SemanticGraph(mockResolvers);

    assert.isFunction(_.addTriple);
    assert.isFunction(_.parse);
    assert.isFunction(_.parseFile);
    assert.isFunction(_.getObjectType);
    assert.isFunction(_.getInterfaceType);
    assert.isFunction(_.getEdgeType);
    assert.isFunction(_.getConnectionType);
    assert.isFunction(_.addFieldOnObjectType);
    assert.isFunction(_.extendFieldOnObjectType);
    assert.isFunction(_.toString);
  });
});

const fooIri = 'http://foo.com/';
const subject = `${fooIri}Subject`;
const predicate = rdfType;
const _predicate = `_${predicate}`;
const object = `${fooIri}Object`;
const fooPerson = `${fooIri}Person`;
const fooName = `${fooIri}name`;
const fooAge = `${fooIri}age`;
const fooGender = `${fooIri}gender`;
const personOntology = `
  ${commonTurtlePrefixes}

  :Person a rdfs:Class ;
    rdfs:label "Person" ;
    rdfs:comment "A human being" .

  :name a rdf:Property ;
    rdfs:label "Name" ;
    rdfs:comment "The name of the Person" ;
    rdfs:domain :Person ;
    rdfs:range xsd:string .

  :age a rdf:Property ;
    rdfs:label "Age" ;
    rdfs:comment "The age of the Person" ;
    rdfs:domain :Person ;
    rdfs:range xsd:integer .

  :gender a rdf:Property ;
    rdfs:label "Gender" ;
    rdfs:comment "The gender of the Person. True for male, false or female" ;
    rdfs:domain :Person ;
    rdfs:range xsd:boolean .
`;

describe('Ontology comprehension', () => {

  it('adds a triple to the graph', () => {
    const _ = new SemanticGraph(mockResolvers);

    assert.doesNotThrow(() => _.addTriple({ subject, predicate, object }));

    assert.isObject(_[subject]);
    assert.isArray(_[subject][predicate]);
    assert.sameMembers(_[subject][predicate], [object]);

    assert.isObject(_[object]);
    assert.isArray(_[object][_predicate]);
    assert.sameMembers(_[object][_predicate], [subject]);

    _.addTriple({ subject, predicate, object: 'foo' });

    assert.isObject(_[subject]);
    assert.isArray(_[subject][predicate]);
    assert.sameMembers(_[subject][predicate], [object, 'foo']);

    assert.isNotObject(_.foo);
  });

  it('does not add the same triple twice', () => {
    const _ = new SemanticGraph(mockResolvers);

    _.addTriple({ subject, predicate, object });
    _.addTriple({ subject, predicate, object });

    assert.isObject(_[subject]);
    assert.isArray(_[subject][predicate]);
    assert.lengthOf(_[subject][predicate], 1);
    assert.sameMembers(_[subject][predicate], [object]);
  });

  it('does not add malformed triples', () => {
    const _ = new SemanticGraph(mockResolvers);

    _.addTriple({ subject: 'foo', predicate, object });

    assert.isNotObject(_.foo);

    _.addTriple({ subject, predicate: 'foo', object });

    assert.isNotObject(_[subject]);

    _.addTriple({ subject, predicate, object });
    _.addTriple({ subject, predicate: 'foo', object });

    assert.isObject(_[subject]);
    assert.isNotArray(_[subject].foo);
  });

  it('Parses turtle', () => {
    const _ = new SemanticGraph(mockResolvers);

    assert.doesNotThrow(() => _.parse(personOntology));
    assert.isObject(_[fooPerson]);
    assert.isObject(_[fooName]);
    assert.isObject(_[fooAge]);
    assert.isObject(_[fooGender]);
    assert.sameMembers(_[fooPerson][_rdfsDomain], [fooName, fooAge, fooGender]);
  });

});

describe('GraphQL objects generation', () => {

  it('generates GraphQLObjectTypes and GraphQLInterfaceTypes', () => {
    const _ = new SemanticGraph(mockResolvers);

    _.parse(personOntology);

    let PersonType, fields;

    assert.doesNotThrow(() => PersonType = _.getObjectType(fooPerson));
    assert.instanceOf(PersonType, GraphQLObjectType);
    assert.doesNotThrow(() => fields = PersonType._typeConfig.fields());
    assert.property(fields, 'name');
    assert.property(fields, 'age');
    assert.property(fields, 'gender');

    assert.doesNotThrow(() => PersonType = _.getInterfaceType(fooPerson));
    assert.instanceOf(PersonType, GraphQLInterfaceType);
    assert.doesNotThrow(() => fields = PersonType._typeConfig.fields());
    assert.property(fields, 'name');
    assert.property(fields, 'age');
    assert.property(fields, 'gender');
  });
});
