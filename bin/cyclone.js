#!/usr/bin/env node
import Os from 'os';
import Fs from 'fs';
import Path from 'path';
import minimist from 'minimist';
import Child from 'child_process';
import Utils from '../lib/utils';
import StormSubmitter from '../lib/storm_submitter';


let argv = minimist(process.argv.slice(2), {
    alias: {
        'topology': 't'
    },
    default: {
        'topology': process.env.npm_package_main || '.'
    }
});


let { topology } = argv;
let rel = topology;
let abs = Path.resolve(topology);
let root = findroot(abs);

if (rel === abs) {
    // An absolute path was provided, so derive a path
    // relative to the module root (being `package.json`)
    rel = Path.relative(findroot('.'), rel);
}

if (Fs.existsSync(abs)) {
    if (Fs.statSync(abs).isDirectory()) {
        // Exists, but is a directory (e.g. '.') so find
        // `main` from package.json and update paths
        let pkg = require(Path.join(root, 'package.json'));
        abs = Path.resolve(pkg.main);
        rel = Path.relative(root, abs);
    }
} else {
    throw new Error(`Unable to locate topology ${topology}`);
}


console.log('Module root:', root);
console.log('Topology (relative):', rel);
console.log('Topology (absolute):', abs);


let tmp = Path.join(Os.tmpdir(), 'cyclone-' + Utils.randInt(0, 10000000));
let resources = Path.join(tmp, 'resources');

console.log(`mkdir ${resources}`);
Utils.mkdirp(resources);

console.log(`cp ${resources}`);
Utils.cp(root, resources);

let storm = Child.spawn('storm', [ 'shell', 'resources/', 'node', Path.join('resources', rel) ], { stdio: [ 'ignore' ], cwd: tmp });
let [ _, stdout, stderr ] =  storm.stdio;
stdout.pipe(process.stdout);
stderr.pipe(process.stderr);


function findroot(dir) {
    dir = Path.resolve(dir);

    if (Fs.statSync(dir).isFile()) {
        dir = Path.dirname(dir);
    }

    return Path.dirname(findup(dir, 'package.json'));
}

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