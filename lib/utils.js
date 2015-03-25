import Fs from 'fs';
import Path from 'path';
import { mkdirpSync as mkdirp, removeSync as rimraf, copySync as cp } from 'fs-extra';


function findup(dir, file) {
    let files = Fs.readdirSync(dir);

    for (let filename of files) {
        if (filename === file) {
            return Path.join(dir, filename);
        }
    }

    let parent = Path.dirname(dir);
    if (parent === dir || parent === '/') {
        return undefined;
    }

    return findup(parent, file);
}


export default {

    cp,

    rimraf,

    mkdirp,

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },

    defer() {
        let deferred = {};
        deferred.promise = new Promise((resolve, reject) => {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });
        return deferred;
    },

    findroot(dir) {
        dir = Path.resolve(dir);

        if (Fs.statSync(dir).isFile()) {
            dir = Path.dirname(dir);
        }

        return Path.dirname(findup(dir, 'package.json'));
    },

    relative(topology) {
        let abs = Path.resolve(topology);
        let root = this.findroot(abs);
        return Path.relative(root, abs);
    }
}