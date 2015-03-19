import Email from './lib/email';
import WordCount from './lib/wordcount';
import SplitSentence from './lib/splitsentence';
import RandomSentence from './lib/randomsentence';
import Cyclone from 'cyclone';
import { TopologyBuilder, Bolt } from 'cyclone';


let random = new RandomSentence([ 'sentence' ]);
let split = new SplitSentence([ 'word' ]);
let count = new WordCount([ 'word', 'count' ]);

let log = Bolt.create(function (tuple, done) {
    let [ word, count ] = tuple.values;
    this.log(`${word}, ${count}`);
    done();
});


let builder = new TopologyBuilder();
builder.setSpout('spout', random);
builder.setBolt('split', split).shuffleGrouping('spout');
builder.setBolt('count', count).fieldsGrouping('split', [ 'word' ]);
builder.setBolt('log', log).fieldsGrouping('count', [ 'word', 'count' ]);


Cyclone.run(builder, { name: 'publish' });