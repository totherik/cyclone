import Path from 'path';
import Utils from './utils';


export default class Storm {

    constructor() {
        this.dispatcher = null;
        this.taskIdsCallbacks = [];
        this.ontasks = taskIds => {
            let callback = this.taskIdsCallbacks.shift();
            callback(taskIds);
        };
    }


    get execution_command() {
        return 'node';
    }


    get script() {
        // The script that invokes the topology (either in local,
        // submit, or run mode) is always the entry point. Here
        // we take that module main file and get a path to it
        // relative to the module root. The expectation here is
        // that a given module's declared "main" is the process
        // entry point for a given topology, regardless of whether
        // or not the topology and associated `run` is contained
        // within that file.
        return Utils.relative(require.main.filename);
    }


    /* Task API */
    initialize(conf, context, done) {
        done();
    }
    /* End Task API */


    /* Component API*/
    declareOutputFields() {
        return [];
    }


    getComponentConfiguration() {
        return {};
    }
    /* End Component API */


    attach(dispatcher) {
        this.dispatcher = dispatcher;
        this.dispatcher.on('tasks', this.ontasks);
    }


    detach() {
        this.dispatcher.removeEventListener('tasks', this.ontasks);
        this.dispatcher = null;
    }


    send(message) {
        this.dispatcher.send(message);
    }


    sync() {
        this.send({ command: 'sync' });
    }


    log(msg) {
        if (typeof msg !== 'string') {
            try {
                msg = JSON.stringify(msg);
            } catch (err) {
                msg = String(msg);
            }
        }
        this.send({ command: 'log', msg });
    }


    emit(message, callback = Function.prototype) {

        if (message.task) {

            // Just fulfill with the provided task
            setImmediate(() => {
                callback([ message.task ]);
            });

        } else {

            // Await response from Storm
            this.taskIdsCallbacks.push(callback);

        }

        let transformed = this.transformMessage(message);
        let payload = Object.assign({ command: 'emit' }, transformed);
        this.send(payload);
    }


    transformMessage(message) {
        return message;
    }

}

