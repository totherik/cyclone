import Fs from 'fs';


export default {

    isHeartbeat({ task, stream }) {
        return task === -1 && stream === '__heartbeat';
    },


    isTaskIds(message) {
        return Array.isArray(message);
    },


    isCommand(message) {
        return 'command' in message;
    },


    writePid(pidfile) {
        Fs.closeSync(Fs.openSync(pidfile, 'w'));
    }

}