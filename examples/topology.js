var WordCount = require('./wordcount');
var SplitSentence = require('./splitsentence');
var RandomSentence = require('./randomsentence');
var Cyclone = require('../');

var log = new Cyclone.Bolt();
log.process = function (tuple, done) {
    this.log(tuple);
    done();
};

var builder = new Cyclone.TopologyBuilder();
builder.setSpout('spout', new RandomSentence());
builder.setBolt('split', new SplitSentence()).shuffleGrouping('spout');
builder.setBolt('count', new WordCount()).fieldsGrouping('split', [ 'word' ]);
builder.setBolt('log', log).fieldsGrouping('count', [ 'word', 'count' ]);

Cyclone.run(builder, { name: 'mytopology' });