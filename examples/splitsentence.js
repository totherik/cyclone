var Util = require('util');
var Bolt = require('../').Bolt;


function SplitSentence() {
    SplitSentence.super_.call(this);
}

Util.inherits(SplitSentence, Bolt);


SplitSentence.prototype.declareOutputFields = function () {
    return [ 'word' ];
};


SplitSentence.prototype.process = function(tuple, done) {
    var sentence = tuple.values[0];
    var words = sentence.split(/\s+/);

    words.forEach(function (word) {
        this.emit({ tuple: [ word ], anchorTupleId: tuple.id });
    }, this);

    done();
};


module.exports = SplitSentence;