import { mkdirpSync as mkdirp, removeSync as rimraf, copySync as cp } from 'fs-extra';


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
    }

}