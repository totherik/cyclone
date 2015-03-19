import test from 'tape';
import Cyclone from '../';


test('bolt', t => {

    t.test('create', t => {

        let bolt = Cyclone.bolt([options], [initialize], process);
        let spout = Cyclone.spout([options], [ack], [fail], nextTuple);

        let bolt = Cyclone.bolt(options, (tuple, done) => {
            this.push();

            done();
        });

        BoltBuilder
            .initialize()
            .process()
            .outputFields()
            .configuration()
            .create();

    });

});
