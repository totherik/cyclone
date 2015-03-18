import Rain from './rain';
import Storm from './storm';


export default class Bolt extends Storm {

    constructor() {
        super();

        this.on('tuple', tuple => {

            if (Rain.isHeartbeat(tuple)) {
                this.sync();
                return;
            }

            this.process(tuple, error => {
                if (error) {
                    this.log(error.stack || 'An unknown error occurred.');
                    this.fail(tuple);
                    return;
                }
                this.ack(tuple);
            });

        });
    }


    static create(initialize, process) {
        if (typeof process !== 'function') {
            process = initialize;
            initialize = undefined;
        }

        let bolt = new Bolt();

        if (typeof initialize === 'function') {
            bolt.initialize = initialize;
        }

        if (typeof process === 'function') {
            bolt.process = process;
        }

        return bolt;
    }


    process(tuple, done) {
        done();
    }


    ack({ id }) {
        this.send({ command: 'ack', id });
    }


    fail({ id }) {
        this.send({ command: 'fail', id });
    }


    transformMessage({ tuple, stream, task, anchorTupleId }) {
        return {
            tuple,
            stream,
            task,
            anchors: [ anchorTupleId ]
        };
    }

}