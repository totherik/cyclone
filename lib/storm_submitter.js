import Thrift from 'thrift';
import { Client } from './generated/Nimbus';


function getConfiguredClient({ host, port = 6627 }) {
    let connection = Thrift.createConnection(host, port, {
        transport: Thrift.TFramedTransport
    });

    return Thrift.createClient(Client, connection);
}


export default class StormSubmitter {

    static submitTopology(name, uploadedJarLocation, { nimbus, config }, topology, callback) {

        let client = getConfiguredClient(nimbus);
        client.getClusterInfo((err, { topologies }) => {
            if (err) {
                callback(err);
                return;
            }

            if (topologies.indexOf(name) !== -1) {
                callback(new Error(`Topology with name \`${name}\` already exists on cluster`));
                return;
            }

            client.submitTopology(name, uploadedJarLocation, JSON.stringify(config), topology, callback);
        });

    }

    static submitTopologyWithOpts() {
        throw new Error('Not implemented.');
    }

    static killTopology(name, cb) {
        throw new Error('Not implemented.');
    }

    static killTopologyWithOpts() {
        throw new Error('Not implemented.');
    }

}