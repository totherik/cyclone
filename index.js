import Bolt from './lib/bolt';
import Spout from './lib/spout';
import Dispatcher from './lib/dispatcher';
import LocalCluster from './lib/local_cluster';
import StormSubmitter from './lib/storm_submitter';
import TopologyBuilder from './lib/topology_builder';


export default {

    Bolt,

    Spout,

    Dispatcher,

    TopologyBuilder,

    StormSubmitter,

    LocalCluster,

    run(builder, options) {

        let topology = builder.createTopology();
        let { name } = options;

        let argv = process.argv.slice(2);
        if (argv[0] === '--local') {

            let cluster = new LocalCluster();
            cluster.submitTopology(name, topology);

            cluster.on('connected', () => {
                console.log('Connected');
                process.once('SIGINT', function () {
                    cluster.shutdown();
                });
            });

            cluster.on('error', err => {
                console.error(err.stack);
            });

            cluster.on('exit', () => {
                console.log('Local cluster exited.');
                process.exit();
            });

        } else if (argv.length) {

            let [ host, port, uploadedJarLocation ] = argv;

            console.log(`Submitting '${uploadedJarLocation}' to ${host}:${port}`);
            StormSubmitter.submitTopology(name, uploadedJarLocation, { nimbus: { host, port } }, topology, function (err, _) {
                if (err) {
                    throw err;
                }
                console.log('Topology submitted.');
            });

        } else {

            let dispatcher = new Dispatcher((conf, context, done) => {
                let id = context['task->component'][context.taskid];
                let component = builder.bolts[id] || builder.spouts[id] || builder.state_spouts[id];
                done(null, component);
            });

            dispatcher.run();

        }

    }

}