import Iterator from './iterator';
import { TFramedTransport, TBufferedTransport, TBinaryProtocol } from 'thrift';
import { Bolt, SpoutSpec, ShellComponent, ComponentCommon, ComponentObject } from './generated/storm_types';
import { Grouping, StreamInfo, StormTopology, GlobalStreamId, NullStruct } from './generated/storm_types';


export default class TopologyBuilder {

    constructor() {
        this.bolts = Object.create(null);
        this.spouts = Object.create(null);
        this.state_spouts = Object.create(null);
        this.common = Object.create(null);
    }


    setBolt(id, bolt, parallelismHint) {
        this.validateUnusedId(id);
        this.initCommon(id, bolt, parallelismHint);
        this.bolts[id] = bolt;

        return new BoltGetter(this, id);
    }


    setSpout(id, spout, parallelismHint) {
        this.validateUnusedId(id);
        this.initCommon(id, spout, parallelismHint);
        this.spouts[id] = spout;
    }


    setStateSpout() {
        throw new Error('Not implemented.');
    }

    //write(callback) {
    //    function complete(buffer) {
    //        callback(null, buffer);
    //    }
    //
    //    let transport = new TFramedTransport(null, complete);
    //    let protocol = new TBinaryProtocol(transport);
    //    let topology = this.createTopology();
    //    topology.write(protocol);
    //    protocol.flush();
    //}
    //
    //read(bytes, callback) {
    //    TFramedTransport.receiver(function (transport) {
    //        var protocol = new TBinaryProtocol(transport);
    //        let topology = new StormTopology();
    //        topology.read(protocol);
    //        callback(null, topology);
    //    })(bytes);
    //}


    createTopology() {
        let bolts = {};
        for (let [ id, bolt ] of Iterator.entries(this.bolts)) {
            let shell = new ShellComponent();
            shell.execution_command = bolt.execution_command;
            shell.script = bolt.script;

            let component = new ComponentObject();
            component.shell = shell;

            let b = new Bolt();
            b.bolt_object = component;
            b.common = this.getComponentCommon(id, bolt);

            bolts[id] = b;
        }

        let spouts = {};
        for (let [ id, spout ] of Iterator.entries(this.spouts)) {
            let shell = new ShellComponent();
            shell.execution_command = spout.execution_command;
            shell.script = spout.script;

            let component = new ComponentObject();
            component.shell = shell;

            let s = new SpoutSpec();
            s.spout_object = component;
            s.common = this.getComponentCommon(id, spout);

            spouts[id] = s;
        }

        return new StormTopology({ bolts, spouts, state_spouts: {} });
    }


    validateUnusedId(id) {
        if (id in this.bolts) {
            throw new Error(`Bolt has already been declared for id ${id}`);
        }

        if (id in this.spouts) {
            throw new Error(`Spout has already been declared for id ${id}`);
        }

        if (id in this.state_spouts) {
            throw new Error(`State spout has already been declared for id ${id}`);
        }
    }


    getComponentCommon(id, component) {
        let stream = new StreamInfo();
        stream.output_fields = component.declareOutputFields() || [];
        stream.direct = false;

        let common = this.common[id];
        common.streams['default'] = stream;
        return common;
    }



    initCommon(id, component, parallelismHint) {
        let common = new ComponentCommon();

        common.inputs = new Map();
        common.streams = {};

        if (!isNaN(Number(parallelismHint))) {
            common.parallelism_hint = parallelismHint;
        }

        let conf = component.getComponentConfiguration() || {};
        common.json_conf = JSON.stringify(conf);

        this.common[id] = common;
    }
}



class BoltGetter {

    constructor(parent, boltId) {
        this.parent = parent;
        this.boltId = boltId;
    }

    fieldsGrouping(componentId, streamId, fields = []) {
        if (Array.isArray(streamId)) {
            fields = streamId;
            streamId = 'default';
        }

        return this.grouping(componentId, streamId, 'fields', fields);
    }

    globalGrouping(componentId, streamId = 'default') {
        return this.fieldsGrouping(componentId, streamId);
    }

    shuffleGrouping(componentId, streamId = 'default') {
        return this.grouping(componentId, streamId, 'shuffle', new NullStruct());
    }

    localOrShuffleGrouping(componentId, streamId = 'default') {
        return this.grouping(componentId, streamId, 'local_or_shuffle', new NullStruct());
    }

    noneGrouping(componentId, streamId = 'default') {
        return this.grouping(componentId, streamId, 'none', new NullStruct());
    }

    allGrouping(componentId, streamId = 'default') {
        return this.grouping(componentId, streamId, 'all', new NullStruct());
    }

    directGrouping(componentId, streamId = 'default') {
        return this.grouping(componentId, streamId, 'direct', new NullStruct());
    }

    grouping(componentId, streamId, attribute, grouping) {
        let globalStreamId = new GlobalStreamId({ componentId, streamId });

        let g = {};
        g[attribute] = grouping;

        this.parent.common[this.boltId].inputs.set(globalStreamId, new Grouping(g));
        return this;
    }

    customGrouping() {
        throw new Error('Not implemented');
    }
}