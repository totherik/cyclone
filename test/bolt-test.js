import test from 'tape';
import Bolt from '../lib/bolt';
import Dispatcher from '../lib/dispatcher';


test('bolt', t => {

    t.test('create', t => {
        let bolt = new Bolt();

        t.ok(bolt);
        t.equal(typeof bolt.emit, 'function');
        t.equal(typeof bolt.log, 'function');
        t.equal(typeof bolt.attach, 'function');
        t.equal(typeof bolt.detach, 'function');

        t.end();
    });


    t.test('initialize', t => {

        let expect = 'pid';
        let args = {
            conf: 'config',
            context: 'context',
            pidDir: 'pids/'
        };


        let dispatcher = new Dispatcher(function (_, $, done) {

            let bolt = new Bolt();

            bolt.attach(this);

            bolt.prepare = function (conf, context, done) {
                t.equal(conf, args.conf);
                t.equal(context, args.context);
                t.equal(typeof done, 'function');
                done();
            };

            bolt.process = function (tuple, done) {
                t.ok(tuple);
                this.emit({ tuple: ['ok'], anchorTupleId: tuple.id });
                done();
            };

            done();

        });


        dispatcher.send = function (message) {

            t.ok(message);

            switch (expect) {
                case 'pid':
                    expect = 'tuple';
                    t.equal(message.pid, process.pid);
                    this.emit('message', { id: 1, tuple: ['ok'] });
                    break;

                case 'tuple':
                    expect = null;
                    t.equal(message.anchors[0], 1);
                    t.equal(message.tuple[0], 'ok');
                    t.end();
                    break;
            }

        };



        dispatcher.emit('message', args);
    });

});
