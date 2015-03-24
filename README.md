cyclone
=======

Write Storm topologies in JavaScript.

### Basic Example
```js
import WordCount from './wordcount';
import SplitSentence from './splitsentence';
import RandomSentence from './randomsentence';
import Cyclone, { TopologyBuilder } from 'cyclone';


let builder = new TopologyBuilder();
builder.setSpout('spout', new RandomSentence());
builder.setBolt('split', new SplitSentence(), 4).shuffleGrouping('spout');
builder.setBolt('count', new WordCount(), 4).fieldsGrouping('split', [ 'word' ]);


Cyclone.run(builder, { name: 'mytopology' });
```


## Spouts
To write a Spout, merely extend the provided `Spout` class and write your own implementation.
```js
import { Spout } from 'cyclone';

export default class RandomSentence extends Spout {

	declareOutputFields() {
		return [ 'sentence' ];
	}

	nextTuple() {
		let rand = Math.floor(Math.random() * SENTENCES.length);
        this.emit({ tuple: [ SENTENCES[rand] ], anchorTupleId: id });
        done();
	}
}
```

#### Default Methods
- `log`

- `emit`

#### Overridable Methods
- `declareOutputFields()` (optional, defaults to `[]`)

- `getComponentConfiguration()` (optional, defaults to `{}`)

- `nextTuple(id, done)` (required)

- `ack(id, done)` (optional)

- `fail(id, done)` (optional)


## Bolts
Similar to Spouts, Bolts are created by extending the provided `Bolt` base class.
```js
import { Bolt } from 'cyclone';

export default class MyBolt extends Bolt {

	declareOutputFields() {
		return [ 'words' ];
	}

	process(tuple, done) {
		let [ sentence ] = tuple.values;
		let words = sentence.split(/\s+/);

        for (let word of words) {
            this.emit({ tuple: [ word ], anchorTupleId: tuple.id });
        }

        done();
	}

}
```

#### Default Methods
- `log`

- `emit`


#### Overridable Methods
- `declareOutputFields()` (optional, defaults to `[]`)

- `getComponentConfiguration()` (optional, defaults to `{}`)

- `initialize(config, context, done)` (optional)

- `process(tuple, done)` (required)


## Running a local cluster
To run a local cluster simply run your topology file with the `--local` flag. For
example, if the Basic Example above were your index.js file, simply run
`$ node . --local`. You will need Apache Storm installed and on your path as well
as an invocation of `run` in your topology file:
```js
Cyclone.run(builder, { name: 'mytopology' });
```

## Submitting a Topology
To submit a topology you will need Apache Storm installed an on your path. If
that's the case, the easiest way would be to run the `cyclone` command against
your topology using an npm script:
```json
{
	"main": "index.js",
	"scripts": {
		"submit": "cyclone"
	}
}
```
In this case, the `cyclone` command will default to using the entrypoint file as
identified in the `"main"` `package.json` property. Otherwise a topology can
be specified using the `-t/--topology` flag. By default, this submits the topology
to the Nimbus host configured in `~/.storm/storm.yaml`.

```yaml
# ~/.storm/storm.yaml
nimbus.host: "255.255.255.255"
```
