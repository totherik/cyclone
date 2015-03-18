import Dispatcher from './dispatcher';
import { EventEmitter } from 'events';


export default class Storm extends EventEmitter {

    constructor() {
        super();

        this.taskIdsCallbacks = [];
        this.on('tasks', taskIds => {
            let callback = this.taskIdsCallbacks.shift();
            if (typeof callback === 'function') {
                callback(taskIds);
            }
        });
    }


    get execution_command() {
        return 'node';
    }


    get script() {
        return '.';
    }


    declareOutputFields() {
        return [];
    }


    getComponentConfiguration() {
        return {};
    }


    initialize(conf, context, done) {
        done();
    }


    send(message) {
        this.emit('send', message);
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


    push(message, callback) {
        if (typeof callback === 'function') {

            if (message.task) {
                throw new Error('Illegal argument: \'task\' is forbidden.')
            }

            this.taskIdsCallbacks.push(callback);

        } else {

            if (!message.task) {
                throw new Error('Illegal argument: \'task\' is required.')
            }

        }

        let transformed = this.transformMessage(message);
        let payload = Object.assign({ command: 'emit' }, transformed);
        this.send(payload);
    }


    transformMessage(message) {
        return message;
    }
}

