

let entries = function (target) {

    return Object.create(target, {

        [Symbol.iterator]: {
            value: function () {
                let target = Object.getPrototypeOf(this);
                let keys = Object.keys(target);

                return {
                    next: () => {

                        if (keys.length) {
                            let key = keys.shift();
                            return {
                                value: [ key, this[key] ],
                                done: false
                            };
                        }

                        return { done: true };
                    }
                };
            }
        }

    });

};


export default {

    entries

};