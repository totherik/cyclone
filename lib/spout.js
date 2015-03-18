import Storm from './storm';


export default class Spout extends Storm {

    constructor() {
        super();

        let sync = () => {
            this.sync();
        };

        this.on('ack', ({ command, id }) => {
            this.ack(id, sync);
        });

        this.on('fail', ({ command, id }) => {
            this.fail(id, sync);
        });

        this.on('next', ({ command, id }) => {
            this.nextTuple(id, sync);
        });
    }


    ack(id, done) {
        done();
    }


    fail(id, done) {
        done();
    }


    nextTuple(id, done) {
        done();
    }

}