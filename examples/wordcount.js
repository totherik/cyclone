var Util = require('util');
var Bolt = require('../').Bolt;


function WordCount() {
    WordCount.super_.call(this);
    this.counts = Object.create(null);
}

Util.inherits(WordCount, Bolt);


WordCount.prototype.declareOutputFields = function () {
    return [ 'word', 'count' ];
};


WordCount.prototype.process = function (tuple, done) {
    var word = tuple.values[0];

    this.counts[word] = (this.counts[word] || 0) + 1;
    this.emit({ tuple: [ word, this.counts[word] ], anchorTupleId: tuple.id });

    done();
};


module.exports = WordCount;