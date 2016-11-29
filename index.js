const SemanticGraph = require('./src/SemanticGraph');
const getIriLocalName = require('./src/utils/getIriLocalName');

SemanticGraph.getIriLocalName = getIriLocalName;

module.exports = SemanticGraph;
