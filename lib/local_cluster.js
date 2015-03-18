import Os from 'os';
import Net from 'net';
import Path from 'path';
import Child from 'child_process';
import { EventEmitter } from 'events';
import Utils from './utils';
import StormSubmitter from './storm_submitter';


function debug() {}


export default class LocalCluster extends EventEmitter {

    constructor() {
        super();
        this.running = Promise.resolve([]);
    }


    submitTopology(name, topology) {

        this.running = this
            .startService('dev-zookeeper', 2181)
            .then(proc => {
                debug('Zookeeper running. Starting remaining services.');
                return Promise.all([
                    proc,
                    this.startService('nimbus', 6627),
                    this.startService('drpc', 3772),
                    this.startService('supervisor'),
                    this.startService('ui')
                ]);
            })
            .then(services => {
                this.emit('connected');

                let tmp = Path.join(Os.tmpdir(), 'cyclone-' + Utils.randInt(0, 10000000));
                let tmpres = Path.join(tmp, 'resources');

                debug(`mkdir ${tmpres}`);
                Utils.mkdirp(tmpres);

                debug(`cp ${tmpres}`);
                Utils.cp('.', tmpres);

                debug('storm shell -c nimbus.host=127.0.0.1 resources/ node resources/');
                let args = [ 'shell', '-c', 'nimbus.host=127.0.0.1', 'resources/', 'node', 'resources/' ];
                let storm = Child.spawn('storm', args, { stdio: [ 'ignore', process.stdout, process.stderr ], cwd: tmp });

                services.push({ name: 'storm', proc: storm });
                return services;
            })
            .catch(err => {
                this.running = Promise.resolve([]);
                this.emit('error', err);
            });

    }


    shutdown() {

        this.running.then(services => {
            let kill = services.map(({ name, proc }) => {

                return new Promise(resolve => {

                    debug('Terminating', name);

                    proc.kill('SIGINT');
                    proc.once('exit', (signal) => {
                        console.log(`${name} exited with code ${signal}`);
                        resolve();
                    });

                });

            });

            Promise
                .all(kill)
                .then(() => this.emit('exit'))
                .catch(err => this.emit('error', err));
        });

    }


    startService(name, port) {

        let args = [ name, '-c', 'dev.zookeeper.path=storm-local/zookeeper', '-c', 'storm.local.dir=storm-local' ];
        let proc = Child.spawn('storm', args, { stdio: [ 'ignore', process.stdout, process.stderr ], cwd: Os.tmpdir() });
        let resolved = Promise.resolve({ name, proc });

        return !isNaN(Number(port)) ? this.onReady(name, port).then(() => resolved) : resolved;
    }


    onReady(name, port) {
        let timeout = 60000;
        let start = Date.now();
        let deferred = Utils.defer();

        (function connect() {
            setTimeout(function () {
                debug(`Attempting to connect to ${name}:${port}`);

                let conn = Net.connect({ port });

                conn.once('error', err => {
                    if (Date.now() - start > timeout) {
                        debug('Connection error. Exiting.');
                        deferred.reject(err);
                        return;
                    }
                    debug('Connection error. Retrying...');
                    connect();
                });

                conn.once('connect', () => {
                    debug(`Connected successfully to ${name}:${port}.`);
                    conn.end();
                });

                conn.once('close', (had_error) => {
                    if (!had_error) {
                        deferred.resolve();
                    }
                });

            }, 1000);
        })();

        return deferred.promise;
    }
}