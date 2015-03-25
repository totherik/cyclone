var Util = require('util');
var Spout = require('../').Spout;


var SENTENCES = [
    'the cow jumped over the moon',
    'an apple a day keeps the doctor away',
    'four score and seven years ago',
    'snow white and the seven dwarfs',
    'i am at two with nature'
];



function RandomSentence() {
    RandomSentence.super_.call(this);
}

Util.inherits(RandomSentence, Spout);


RandomSentence.prototype.declareOutputFields = function () {
    return [ 'sentence' ];
};


RandomSentence.prototype.nextTuple = function (id, done) {
    var self = this;
    setTimeout(function () {
        var rand = Math.floor(Math.random() * SENTENCES.length);
        self.emit({ tuple: [ SENTENCES[rand] ], anchorTupleId: id });
        done();
    }, 1000);
};


module.exports = RandomSentence;