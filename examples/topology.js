import WordCount from './wordcount';
import SplitSentence from './splitsentence';
import RandomSentence from './randomsentence';
import Cyclone, { TopologyBuilder } from 'cyclone';


let builder = new TopologyBuilder();
builder.setSpout('spout', new RandomSentence());
builder.setBolt('split', new SplitSentence(), 4).shuffleGrouping('spout');
builder.setBolt('count', new WordCount(), 4).fieldsGrouping('split', [ 'word' ]);


Cyclone.run(builder, { name: 'mytopology' });