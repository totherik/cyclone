import test from 'tape';
import Spout from '../';

test('spout', t => {


    t.test('create', t => {

        SpoutBuilder
            .ack()
            .fail()
            .nextTuple()
            .outputFields()
            .configuration()
            .create();

    });

});
