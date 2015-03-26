import debuglog from 'debuglog';
import Bolt from './lib/bolt';
import Spout from './lib/spout';
import Dispatcher from './lib/dispatcher';
import LocalCluster from './lib/local_cluster';
import StormSubmitter from './lib/storm_submitter';
import TopologyBuilder from './lib/topology_builder';


const debug = debuglog('cyclone');
const DEFAULT_OPTIONS = {
    name: 'topology',
    config: {}
};


export default {

    Bolt,


    Spout,


    Dispatcher,


    TopologyBuilder,


    StormSubmitter,


    LocalCluster,


    run(builder, options = { nimbus: {}, config: {}}) {
        options = Object.assign(DEFAULT_OPTIONS, options);

        let argv = process.argv.slice(2);
        if (argv.length) {

            let topology = builder.createTopology();

            if (argv[0] === '--local') {

                // OPTION 1: Called locally to start a LocalCluster
                let cluster = new LocalCluster();
                cluster.submitTopology(topology, options);

                cluster.on('connected', () => {
                    debug('Connected');
                    process.once('SIGINT', function () {
                        cluster.shutdown();
                    });
                });

                cluster.on('error', err => {
                    debug(err.stack);
                });

                cluster.on('exit', () => {
                    debug('Local cluster exited.');
                    process.exit();
                });

            } else {

                // OPTION 2: Called by `storm shell`
                let [ host, port, uploadedJarLocation ] = argv;
                let nimbus = { host, port };

                debug(`Submitting '${options.name}' (${uploadedJarLocation}) to ${host}:${port}.`);
                StormSubmitter.submitTopology(options.name, uploadedJarLocation, { nimbus, config: options.config }, topology, function (err, _) {
                    if (err) {
                        throw err;
                    }
                    debug(`Topology '${options.name}' submitted.`);
                });

            }

        } else {

            // OPTION 3: Invoked as a task.
            let dispatcher = new Dispatcher(function (conf, context, done) {
                let id = context['task->component'][context.taskid];
                let component = builder.bolts[id] || builder.spouts[id] || builder.state_spouts[id];
                component.attach(this);
                component.init(conf, context, done);
            });

            dispatcher.run();

        }

    }

}