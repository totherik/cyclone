

let entries = function (target) {

    return Object.create(target, {

        [Symbol.iterator]: {

            value: function () {

                let keys = Object.keys(Object.getPrototypeOf(this));

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