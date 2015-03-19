import Rain from './rain';
import { EventEmitter } from 'events';


const SEPARATOR = '\nend\n';
const Tuple = Object.freeze({

    create({ id, comp, stream, task, tuple }) {
        return {
            id,
            stream,
            task,
            component: comp,
            values: tuple
        };
    }

});


export default class Dispatcher extends EventEmitter {

    constructor(initialize, readable = process.stdin, writeable = process.stdout) {
        super();

        this.initialize = initialize;
        this.readable = readable;
        this.writeable = writeable;

        this.once('message', ({ conf, context, pidDir }) => {

            this.initialize(conf, context, (err, component) => {
                if (err) {
                    this.log(err.stack);
                    return;
                }

                component.on('send', message => {
                    this.send(message);
                });

                component.initialize(conf, context, () => {
                    let pid = process.pid;
                    Rain.writePid(`${pidDir}/${pid}`);
                    this.send({ pid });
                });


                this.on('message', message => {
                    if (Rain.isTaskIds(message)) {
                        component.emit('tasks', message);
                        return;
                    }

                    if (Rain.isCommand(message)) {
                        component.emit(message.command, message);
                        return;
                    }

                    component.emit('tuple', Tuple.create(message));
                });

            });

        });
    }


    run() {
        let part = '';

        this.readable.on('readable', () => {
            let chunk, chunks = [];

            // Read in all the data.
            while ((chunk = this.readable.read()) !== null) {
                chunks.push(chunk);
            }

            // Combine newly read data with any existing data (`part`)
            chunk = Buffer.concat(chunks);
            part += chunk.toString('utf8');

            // Extract individual messages
            let messages = part.split(SEPARATOR);

            // If there are no terminators (e.g. length === 1 or 0),
            // assume there are no complete messages, thus there
            // is no work to do.
            if (messages.length > 1) {
                // Last message is either empty string (part ended
                // with separator), or non-empty string (partial
                // message awaiting remaining content and separator).
                // Either way, keep that for next read operation.
                part = messages.pop();

                // The remaining contents of the array are messages,
                // so emit those.
                for (let message of messages) {
                    this.emit('message', JSON.parse(message));
                }
            }
        });
    }


    send(message) {
        this.writeable.write(JSON.stringify(message) + SEPARATOR, 'utf8');
    }

}