import Storm from './storm';


export default class Bolt extends Storm {

    constructor() {
        super();

        this.onheartbeat = () => this.sync;
        this.ontuple = tuple => {

            this.process(tuple, error => {
                if (error) {
                    this.log(error.stack || 'An unknown error occurred.');
                    this.send({command: 'fail', id: tuple.id });
                    return;
                }
                this.send({command: 'ack', id: tuple.id });
            });

        };
    }


    attach(dispatcher) {
        super.attach(dispatcher);
        this.dispatcher.on('heartbeat', this.onheartbeat);
        this.dispatcher.on('tuple', this.ontuple);
    }


    detach() {
        this.dispatcher.removeEventListener('tuple', this.ontuple);
        this.dispatcher.removeEventListener('heartbeat', this.onheartbeat);
        super.detach();
    }


    process(tuple, done) {

        throw new Error('Not implemented.');
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