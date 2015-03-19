import Storm from './storm';


export default class Spout extends Storm {

    constructor() {
        super();

        let sync = () => this.sync();
        this.onack = ({ id }) => this.ack(id, sync);
        this.onfail = ({ id }) => this.fail(id, sync);
        this.onnext = ({ id }) => this.nextTuple(id, sync);
    }


    attach(dispatcher) {
        super.attach(dispatcher);
        this.dispatcher.on('ack', this.onack);
        this.dispatcher.on('fail', this.onfail);
        this.dispatcher.on('next', this.onnext);
    }


    detach() {
        this.dispatcher.removeEventListener('ack', this.onack);
        this.dispatcher.removeEventListener('fail', this.onfail);
        this.dispatcher.removeEventListener('next', this.onnext);
    }


    nextTuple(id, done) {
        throw new Error('Not implemented');
    }


    ack(id, done) {
        done();
    }


    fail(id, done) {
        done();
    }

}