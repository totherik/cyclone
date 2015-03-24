import test from 'tape';
import Spout from '../lib/spout';
import Dispatcher from '../lib/dispatcher';


test('spout', t => {

    let dispatcher = new Dispatcher();

    t.test('create', t => {
        let spout = new Spout();

        t.ok(spout);
        t.equal(typeof spout.emit, 'function');
        t.equal(typeof spout.log, 'function');
        t.equal(typeof spout.attach, 'function');
        t.equal(typeof spout.detach, 'function');

        t.end();
    });

});
