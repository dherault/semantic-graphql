/* global describe, it */
const { assert } = require('chai');
const { GraphQLObjectType, GraphQLInterfaceType } = require('graphql');
const mockResolvers = require('./utils/mockResolvers');
const commonTurtlePrefixes = require('./utils/commonTurtlePrefixes');
const SemanticGraph = require('..');
const castArrayShape = require('../src/utils/castArrayShape');
const isNil = require('../src/utils/isNil');
const capitalize = require('../src/utils/capitalize');
const { rdfsClass, rdfType, _rdfsDomain } = require('../src/constants');

// TODO: split this file

// NOTE: getIriLocalName and isIri will be imported from an external lib someday
describe('utils', () => {

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
const predicate = `${fooIri}Predicate`;
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
